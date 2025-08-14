import { wrap, Remote } from 'comlink';

// Type definitions for worker communication
interface WorkerApi {
  extractContent(
    taskId: string,
    file: ArrayBuffer,
    fileName: string,
    mimeType: string,
    onProgress?: (progress: number) => void
  ): Promise<{
    id: string;
    success: boolean;
    data?: {
      content: string;
      wordCount: number;
      characterCount: number;
      extractedAt: string;
    };
    error?: string;
  }>;

  compressContent(
    taskId: string,
    content: string,
    method?: 'gzip' | 'deflate' | 'basic',
    onProgress?: (progress: number) => void
  ): Promise<{
    id: string;
    success: boolean;
    data?: {
      originalSize: number;
      compressedSize: number;
      compressionRatio: number;
      compressedData: number[];
      method: string;
    };
    error?: string;
  }>;

  processBatch(
    tasks: Array<{
      id: string;
      type: string;
      data: unknown;
      options?: unknown;
    }>,
    onProgress?: (completed: number, total: number, currentTask?: string) => void
  ): Promise<Array<{
    id: string;
    success: boolean;
    data?: unknown;
    error?: string;
  }>>;

  cancelTask(taskId: string): void;
  cancelAllTasks(): void;
  cleanup(): void;
}

export interface ProcessingProgress {
  taskId: string;
  progress: number;
  stage?: string;
  message?: string;
}

export interface BatchProgress {
  completed: number;
  total: number;
  currentTask?: string;
  overallProgress: number;
}

class DocumentWorkerManager {
  private worker: Worker | null = null;
  private workerApi: Remote<WorkerApi> | null = null;
  private isInitialized = false;
  private progressCallbacks: Map<string, (progress: ProcessingProgress) => void> = new Map();
  private batchProgressCallback: ((progress: BatchProgress) => void) | null = null;

  constructor() {
    this.initializeWorker();
  }

  private async initializeWorker() {
    try {
      // Create worker from the TypeScript file
      this.worker = new Worker(
        new URL('../workers/documentProcessor.worker.ts', import.meta.url),
        { type: 'module' }
      );

      // Wrap worker with Comlink
      this.workerApi = wrap<WorkerApi>(this.worker);
      this.isInitialized = true;

      // Handle worker errors
      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        this.handleWorkerError(error);
      };

      console.log('Document processing worker initialized');
    } catch (error) {
      console.error('Failed to initialize worker:', error);
      this.isInitialized = false;
    }
  }

  public isReady(): boolean {
    return this.isInitialized && this.workerApi !== null;
  }

  // Process document extraction in worker
  public async extractDocument(
    file: File,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<{
    content: string;
    wordCount: number;
    characterCount: number;
    extractedAt: string;
  }> {
    if (!this.isReady()) {
      throw new Error('Worker not initialized');
    }

    const taskId = this.generateTaskId();
    const arrayBuffer = await file.arrayBuffer();

    if (onProgress) {
      this.progressCallbacks.set(taskId, onProgress);
    }

    try {
      const result = await this.workerApi!.extractContent(
        taskId,
        arrayBuffer,
        file.name,
        file.type,
        (progress: number) => {
          onProgress?.({
            taskId,
            progress,
            stage: 'extraction',
            message: `Extracting content: ${Math.round(progress)}%`
          });
        }
      );

      if (!result.success) {
        throw new Error(result.error || 'Extraction failed');
      }

      return result.data!;
    } finally {
      this.progressCallbacks.delete(taskId);
    }
  }

  // Process document compression in worker
  public async compressDocument(
    content: string,
    method: 'gzip' | 'deflate' | 'basic' = 'basic',
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<{
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    compressedData: Uint8Array;
    method: string;
  }> {
    if (!this.isReady()) {
      throw new Error('Worker not initialized');
    }

    const taskId = this.generateTaskId();

    if (onProgress) {
      this.progressCallbacks.set(taskId, onProgress);
    }

    try {
      const result = await this.workerApi!.compressContent(
        taskId,
        content,
        method,
        (progress: number) => {
          onProgress?.({
            taskId,
            progress,
            stage: 'compression',
            message: `Compressing: ${Math.round(progress)}%`
          });
        }
      );

      if (!result.success) {
        throw new Error(result.error || 'Compression failed');
      }

      return {
        ...result.data!,
        compressedData: new Uint8Array(result.data!.compressedData)
      };
    } finally {
      this.progressCallbacks.delete(taskId);
    }
  }

  // Process multiple documents in batch
  public async processBatch(
    files: File[],
    operations: Array<'extract' | 'compress'> = ['extract'],
    onProgress?: (progress: BatchProgress) => void
  ): Promise<Array<{
    file: File;
    success: boolean;
    data?: unknown;
    error?: string;
  }>> {
    if (!this.isReady()) {
      throw new Error('Worker not initialized');
    }

    this.batchProgressCallback = onProgress;

    // Prepare tasks
    const tasks = await Promise.all(
      files.map(async (file, index) => ({
        id: `batch_${index}_${this.generateTaskId()}`,
        type: operations[index % operations.length],
        data: {
          buffer: await file.arrayBuffer(),
          fileName: file.name,
          mimeType: file.type,
          content: operations[index % operations.length] === 'compress' ? await file.text() : undefined
        },
        file
      }))
    );

    try {
      const results = await this.workerApi!.processBatch(
        tasks.map(({ file, ...task }) => task),
        (completed: number, total: number, currentTask?: string) => {
          onProgress?.({
            completed,
            total,
            currentTask,
            overallProgress: (completed / total) * 100
          });
        }
      );

      return results.map((result, index) => ({
        file: tasks[index].file,
        success: result.success,
        data: result.data,
        error: result.error
      }));
    } finally {
      this.batchProgressCallback = null;
    }
  }

  // Cancel a specific task
  public cancelTask(taskId: string): void {
    if (this.isReady()) {
      this.workerApi!.cancelTask(taskId);
      this.progressCallbacks.delete(taskId);
    }
  }

  // Cancel all running tasks
  public cancelAllTasks(): void {
    if (this.isReady()) {
      this.workerApi!.cancelAllTasks();
      this.progressCallbacks.clear();
      this.batchProgressCallback = null;
    }
  }

  // Process documents with chunking for large files
  public async processLargeDocument(
    file: File,
    chunkSize: number = 5 * 1024 * 1024, // 5MB chunks
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<{
    content: string;
    wordCount: number;
    characterCount: number;
    extractedAt: string;
    chunks: number;
  }> {
    const taskId = this.generateTaskId();
    const fileSize = file.size;
    const totalChunks = Math.ceil(fileSize / chunkSize);

    if (totalChunks === 1) {
      // Process as single file if it's not that large
      const result = await this.extractDocument(file, onProgress);
      return { ...result, chunks: 1 };
    }

    let combinedContent = '';
    let totalWords = 0;
    let totalCharacters = 0;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, fileSize);
      const chunk = file.slice(start, end);

      onProgress?.({
        taskId,
        progress: (i / totalChunks) * 100,
        stage: 'chunked-extraction',
        message: `Processing chunk ${i + 1} of ${totalChunks}`
      });

      try {
        const chunkResult = await this.extractDocument(
          new File([chunk], `${file.name}_chunk_${i}`, { type: file.type })
        );

        combinedContent += chunkResult.content + '\n';
        totalWords += chunkResult.wordCount;
        totalCharacters += chunkResult.characterCount;
      } catch (error) {
        console.warn(`Failed to process chunk ${i + 1}:`, error);
        // Continue with other chunks
      }
    }

    onProgress?.({
      taskId,
      progress: 100,
      stage: 'completed',
      message: 'Large document processing completed'
    });

    return {
      content: combinedContent.trim(),
      wordCount: totalWords,
      characterCount: totalCharacters,
      extractedAt: new Date().toISOString(),
      chunks: totalChunks
    };
  }

  // Get worker performance statistics
  public getPerformanceStats(): {
    tasksProcessed: number;
    activeCallbacks: number;
    isReady: boolean;
  } {
    return {
      tasksProcessed: this.progressCallbacks.size,
      activeCallbacks: this.progressCallbacks.size,
      isReady: this.isReady()
    };
  }

  // Restart worker if needed
  public async restartWorker(): Promise<void> {
    if (this.worker) {
      this.cleanup();
    }
    await this.initializeWorker();
  }

  // Handle worker errors
  private handleWorkerError(error: ErrorEvent): void {
    console.error('Worker encountered an error:', error);
    
    // Notify all pending callbacks about the error
    for (const callback of this.progressCallbacks.values()) {
      callback({
        taskId: 'error',
        progress: 0,
        stage: 'error',
        message: 'Worker error occurred'
      });
    }

    this.progressCallbacks.clear();
    this.batchProgressCallback = null;

    // Attempt to restart worker
    setTimeout(() => {
      this.restartWorker();
    }, 1000);
  }

  // Cleanup resources
  public cleanup(): void {
    if (this.isReady()) {
      this.workerApi!.cleanup();
    }

    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.workerApi = null;
    this.isInitialized = false;
    this.progressCallbacks.clear();
    this.batchProgressCallback = null;
  }

  // Utility methods
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create and export singleton instance
export const documentWorkerManager = new DocumentWorkerManager();
export default DocumentWorkerManager;
