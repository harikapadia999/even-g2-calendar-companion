/**
 * Even Hub Bridge Service
 * 
 * Manages communication with Even Hub SDK for G2 glasses.
 * Handles initialization, container setup, text/image updates, and events.
 */

import {
  waitForEvenAppBridge,
  TextContainerUpgrade,
  type EvenAppBridge as EvenAppBridgeType,
  type CreateStartUpPageContainer,
  type RebuildPageContainer,
  type ImageRawDataUpdate,
  type EvenHubEvent,
  ImageRawDataUpdateResult,
} from '@evenrealities/even_hub_sdk';

export type EvenHubEventHandler = (event: EvenHubEvent) => void;

export class EvenHubBridge {
  private bridge: EvenAppBridgeType | null = null;
  private imageQueue: ImageRawDataUpdate[] = [];
  private isSendingImage = false;
  private unsubscribeEvents: (() => void) | null = null;
  private isInitialized = false;

  /**
   * Initialize the Even Hub SDK bridge
   * Must be called before any other operations
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      console.warn('[EvenHubBridge] Already initialized');
      return;
    }

    try {
      console.log('[EvenHubBridge] Waiting for Even App Bridge...');
      this.bridge = await waitForEvenAppBridge();
      this.isInitialized = true;
      console.log('[EvenHubBridge] Bridge ready');
    } catch (err) {
      console.error('[EvenHubBridge] Bridge init failed:', err);
      console.warn('[EvenHubBridge] Running outside Even Hub? Bridge will be null.');
      this.bridge = null;
      throw new Error('Even Hub SDK not available. Please run this app inside Even Hub.');
    }
  }

  /**
   * Check if bridge is initialized and available
   */
  isAvailable(): boolean {
    return this.isInitialized && this.bridge !== null;
  }

  /**
   * Setup initial page containers
   * Should be called once during app initialization
   */
  async setupPage(container: CreateStartUpPageContainer): Promise<boolean> {
    if (!this.bridge) {
      console.error('[EvenHubBridge] No bridge available - cannot setup page');
      return false;
    }

    try {
      console.log('[EvenHubBridge] Setting up page containers...');
      const result = await this.bridge.createStartUpPageContainer(container);
      const success = result === 0;
      
      if (!success) {
        console.error('[EvenHubBridge] createStartUpPageContainer failed with code:', result);
      } else {
        console.log('[EvenHubBridge] Page setup successful');
      }
      
      return success;
    } catch (err) {
      console.error('[EvenHubBridge] createStartUpPageContainer error:', err);
      return false;
    }
  }

  /**
   * Rebuild page containers (for major layout changes)
   * Use sparingly - prefer updateText for content updates
   */
  async updatePage(container: RebuildPageContainer): Promise<boolean> {
    if (!this.bridge) {
      console.error('[EvenHubBridge] No bridge available - cannot update page');
      return false;
    }

    try {
      console.log('[EvenHubBridge] Rebuilding page containers...');
      const success = await this.bridge.rebuildPageContainer(container);
      
      if (!success) {
        console.warn('[EvenHubBridge] rebuildPageContainer returned false');
      } else {
        console.log('[EvenHubBridge] Page rebuild successful');
      }
      
      return success;
    } catch (err) {
      console.error('[EvenHubBridge] rebuildPageContainer error:', err);
      return false;
    }
  }

  /**
   * Update text content in a specific container
   * This is the primary method for updating display text
   */
  async updateText(
    containerID: number,
    containerName: string,
    content: string
  ): Promise<boolean> {
    if (!this.bridge) {
      console.error('[EvenHubBridge] No bridge available - cannot update text');
      return false;
    }

    try {
      const success = await this.bridge.textContainerUpgrade(
        new TextContainerUpgrade({
          containerID,
          containerName,
          content,
        })
      );
      
      if (!success) {
        console.warn('[EvenHubBridge] textContainerUpgrade failed for container:', containerName);
      }
      
      return success;
    } catch (err) {
      console.error('[EvenHubBridge] textContainerUpgrade error:', err);
      return false;
    }
  }

  /**
   * Update image data (1-bit BMP format)
   * Images are queued and sent serially as required by SDK
   */
  async updateImage(data: ImageRawDataUpdate): Promise<void> {
    this.imageQueue.push(data);
    await this.processImageQueue();
  }

  /**
   * Process queued images serially
   * SDK requires images to be sent one at a time
   */
  private async processImageQueue(): Promise<void> {
    if (this.isSendingImage || !this.bridge) {
      return;
    }

    this.isSendingImage = true;

    while (this.imageQueue.length > 0) {
      const data = this.imageQueue.shift()!;
      
      try {
        const result = await this.bridge.updateImageRawData(data);
        
        if (!ImageRawDataUpdateResult.isSuccess(result)) {
          console.warn('[EvenHubBridge] Image update not successful:', result);
        }
      } catch (err) {
        console.error('[EvenHubBridge] Image update error:', err);
      }
    }

    this.isSendingImage = false;
  }

  /**
   * Subscribe to Even Hub events (scroll, tap, double-tap)
   * Returns unsubscribe function
   */
  subscribeEvents(handler: EvenHubEventHandler): () => void {
    // Unsubscribe previous handler if exists
    this.unsubscribeEvents?.();

    if (!this.bridge) {
      console.error('[EvenHubBridge] No bridge available - cannot subscribe to events');
      return () => {};
    }

    try {
      console.log('[EvenHubBridge] Subscribing to events...');
      this.unsubscribeEvents = this.bridge.onEvenHubEvent((event) => {
        handler(event);
      });
      
      console.log('[EvenHubBridge] Event subscription successful');
      
      return () => {
        this.unsubscribeEvents?.();
        this.unsubscribeEvents = null;
      };
    } catch (err) {
      console.error('[EvenHubBridge] Event subscription error:', err);
      this.unsubscribeEvents = null;
      return () => {};
    }
  }

  /**
   * Shutdown and cleanup
   * Should be called when app is closing
   */
  async shutdown(): Promise<void> {
    console.log('[EvenHubBridge] Shutting down...');
    
    // Unsubscribe from events
    this.unsubscribeEvents?.();
    this.unsubscribeEvents = null;

    // Shutdown page container
    if (this.bridge) {
      try {
        await this.bridge.shutDownPageContainer(0);
        console.log('[EvenHubBridge] Shutdown complete');
      } catch (err) {
        console.error('[EvenHubBridge] Shutdown error:', err);
      }
    }

    this.isInitialized = false;
    this.bridge = null;
  }

  /**
   * Get current bridge status for debugging
   */
  getStatus(): {
    isInitialized: boolean;
    isAvailable: boolean;
    hasEventSubscription: boolean;
    imageQueueLength: number;
  } {
    return {
      isInitialized: this.isInitialized,
      isAvailable: this.isAvailable(),
      hasEventSubscription: this.unsubscribeEvents !== null,
      imageQueueLength: this.imageQueue.length,
    };
  }
}
