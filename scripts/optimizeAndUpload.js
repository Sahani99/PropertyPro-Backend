// scripts/optimizeAndUpload.js
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const util = require('util');
const execPromise = util.promisify(exec);

// Azure Blob Storage SDK
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

// Metadata store (assuming you have this from previous steps)
const { updateModelMetadata } = require('../utils/metadataStore'); // Adjust path if needed
const METADATA_FILE = path.resolve(__dirname, '..', 'data', 'models.json');

// Load .env variables (ensure dotenv is configured if this script runs standalone)
// If this script is always called from your main app that already loads .env, this might not be strictly needed here.
// require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });


const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const AZURE_STORAGE_ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const AZURE_STORAGE_CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME;

if (!AZURE_STORAGE_ACCOUNT_NAME || !AZURE_STORAGE_ACCOUNT_KEY || !AZURE_STORAGE_CONTAINER_NAME) {
    console.error("[Optimizer] Azure Storage credentials or container name not configured in .env. Exiting.");
    process.exit(1);
}

// Create BlobServiceClient
const sharedKeyCredential = new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY);
const blobServiceClient = new BlobServiceClient(
    `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
    sharedKeyCredential
);

const TEMP_OPTIMIZED_DIR = path.resolve(__dirname, '..', 'temp_optimized'); // Where optimized files are saved locally

// Get arguments passed from the controller
const tempInputPath = process.argv[2];
const projectId = process.argv[3];
const originalFilename = process.argv[4];

async function main() {
    console.log(`[Optimizer-Azure] Started for ${originalFilename} (Project: ${projectId})`);
    console.log(`[Optimizer-Azure] Input path: ${tempInputPath}`);

    if (!tempInputPath || !projectId || !originalFilename) {
        console.error('[Optimizer-Azure] Error: Missing arguments.');
        process.exit(1);
    }

    try {
        await fs.mkdir(TEMP_OPTIMIZED_DIR, { recursive: true });
    } catch (e) { /* ignore if exists */ }

    const optimizedFileBaseName = `optimized_${path.parse(originalFilename).name}_${Date.now()}`;
    const optimizedFileExt = '.glb'; // Assuming it's always GLB
    const optimizedFileNameWithExt = optimizedFileBaseName + optimizedFileExt;
    const tempOptimizedPath = path.join(TEMP_OPTIMIZED_DIR, optimizedFileNameWithExt);

    try {
        // 1. Optimize using gltf-transform CLI (same as before)
        console.log(`[Optimizer-Azure] Optimizing ${tempInputPath} -> ${tempOptimizedPath}`);
        const command = `gltf-transform optimize "${tempInputPath}" "${tempOptimizedPath}" --texture-compress webp --texture-resize "width=1024,height=1024" --draco "level=7,quantizePosition=12"`;
        console.log(`[Optimizer-Azure] Executing: ${command}`);
        const { stdout, stderr } = await execPromise(command);
        if (stderr) console.warn(`[Optimizer-Azure] gltf-transform stderr: ${stderr}`);
        // console.log(`[Optimizer-Azure] gltf-transform stdout: ${stdout}`);
        console.log(`[Optimizer-Azure] Optimization complete for ${originalFilename}.`);

        // 2. Upload optimized file to Azure Blob Storage
        console.log(`[Optimizer-Azure] Uploading ${tempOptimizedPath} to Azure Blob Storage...`);
        const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER_NAME);
        const blobName = `future_projects_optimized/${projectId}/models/${optimizedFileNameWithExt}`; // Path within the container
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Upload file from disk
        await blockBlobClient.uploadFile(tempOptimizedPath, {
            blobHTTPHeaders: { blobContentType: 'model/gltf-binary' } // Set appropriate content type
        });
        const azureBlobUrl = blockBlobClient.url;
        console.log(`[Optimizer-Azure] Azure Blob upload successful: ${azureBlobUrl}`);

        // 3. Update metadata (models.json or your actual database)
        const newModelEntry = {
            id: projectId,
            name: originalFilename,
            optimizedName: optimizedFileNameWithExt,
            assetUrl: azureBlobUrl, // Generic name for the URL
            storageType: 'azure_blob',
            uploadedAt: new Date().toISOString(),
            status: 'processed'
        };
        await updateModelMetadata(METADATA_FILE, newModelEntry);
        console.log(`[Optimizer-Azure] Metadata updated for ${originalFilename}.`);

    } catch (error) {
        console.error(`[Optimizer-Azure] Error processing ${originalFilename}:`, error);
        const errorEntry = { id: projectId, name: originalFilename, status: 'failed_azure_upload', error: error.message };
        await updateModelMetadata(METADATA_FILE, errorEntry, true).catch(e => console.error("Failed to update metadata with error", e));
        process.exitCode = 1;
    } finally {
        // 4. Cleanup temporary files
        console.log(`[Optimizer-Azure] Cleaning up temporary files for ${originalFilename}...`);
        await fs.unlink(tempInputPath).catch(e => console.error(`[Optimizer-Azure] Failed to delete temp input ${tempInputPath}:`, e));
        if (await fs.stat(tempOptimizedPath).catch(() => false)) { // Check if optimized file exists
            await fs.unlink(tempOptimizedPath).catch(e => console.error(`[Optimizer-Azure] Failed to delete temp optimized ${tempOptimizedPath}:`, e));
        }
        console.log(`[Optimizer-Azure] Finished processing ${originalFilename}.`);
    }
}

// Ensure utils/metadataStore.js exists and is correctly required
// e.g. const { updateModelMetadata } = require('../utils/metadataStore');

main().catch(err => {
    console.error("[Optimizer-Azure] Unhandled error in main:", err);
    process.exit(1);
});