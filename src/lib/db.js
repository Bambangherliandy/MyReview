import { MongoClient } from 'mongodb';
import dns from 'node:dns';

// Paksa DNS publik supaya lookup SRV Atlas tidak gagal di DNS ISP
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Harap tambahkan MONGODB_URI ke file .env.local!');
}

const options = {
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
};

function createClientPromise() {
  const client = new MongoClient(uri, options);
  return client.connect();
}

let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // Simpan di global agar tidak membuat koneksi baru setiap hot reload
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise().catch((err) => {
      global._mongoClientPromise = undefined; // jangan cache promise yang gagal
      throw err;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = createClientPromise();
}

export default clientPromise;