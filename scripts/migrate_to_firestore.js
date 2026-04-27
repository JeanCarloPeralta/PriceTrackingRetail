import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// WARNING: You must download your Firebase Admin Service Account Key JSON file
// from Firebase Settings -> Service Accounts, and save it as 'serviceAccountKey.json' in this folder.
const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');

async function migrateData() {
    let serviceAccount;

    if (process.env.SERVICE_ACCOUNT_KEY) {
        try {
            serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
            console.log("Using service account from environment variable.");
        } catch (e) {
            console.error("Failed to parse SERVICE_ACCOUNT_KEY environment variable as JSON.");
            process.exit(1);
        }
    } else if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        console.log("Using service account from local file.");
    } else {
        console.error("Missing service account credentials! Provide SERVICE_ACCOUNT_KEY env var or serviceAccountKey.json file.");
        process.exit(1);
    }

    initializeApp({
        credential: cert(serviceAccount)
    });

    const db = getFirestore();
    const DATA_FILE = path.join(process.cwd(), 'public/data/products.json');
    
    if (!fs.existsSync(DATA_FILE)) {
        console.error("products.json not found!");
        process.exit(1);
    }

    const products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    console.log(`Starting migration of ${products.length} products to Firestore...`);

    const batchSize = 500; // Firestore limit for batches is 500
    
    for (let i = 0; i < products.length; i += batchSize) {
        const batch = db.batch();
        const chunk = products.slice(i, i + batchSize);
        
        chunk.forEach(product => {
            // Using ID or Link as the document ID depending on availability
            // Safe doc name avoids slashes
            const safeId = product.id || String(product.link).replace(/[^a-zA-Z0-9]/g, '');
            const docRef = db.collection('products').doc(safeId);
            batch.set(docRef, product, { merge: true });
        });

        console.log(`Committing batch ${i} to ${i + chunk.length}...`);
        await batch.commit();
        console.log(`Batch successful.`);
    }

    console.log("Migration Complete!");
}

migrateData().catch(console.error);
