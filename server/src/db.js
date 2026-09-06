import mongoose from 'mongoose';

// Atlas M0 (free) allows 500 connections cluster-wide. Mongoose defaults to a
// pool of 100 per process, and `node --watch` can leave the old pool draining
// across restarts, so keep it small — dev never needs more than a handful.
const MAX_POOL_SIZE = 10;

// Named here rather than appended to MONGODB_URI so the pasted connection
// string is never edited. A database in the URI path still wins.
const DEFAULT_DB = 'candidate_portal';

export const connect = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI is empty. Paste your Atlas connection string into server/.env'
    );
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, {
      dbName: DEFAULT_DB,
      maxPoolSize: MAX_POOL_SIZE,
      // Fail fast with a readable message instead of hanging for 30s.
      serverSelectionTimeoutMS: 8000
    });
  } catch (err) {
    throw new Error(explain(err));
  }

  console.log(`Mongo connected → ${mongoose.connection.name} (pool ${MAX_POOL_SIZE})`);
};

// Atlas failures are nearly always one of three things; say which.
const explain = (err) => {
  const msg = err?.message ?? String(err);

  if (/bad auth|Authentication failed/i.test(msg)) {
    return 'Atlas rejected the username or password in MONGODB_URI. Check the database user, and URL-encode any special characters in the password.';
  }
  if (/ENOTFOUND|querySrv|getaddrinfo/i.test(msg)) {
    return 'Could not resolve the Atlas host in MONGODB_URI. Check the cluster address.';
  }
  if (/timed out|ServerSelection/i.test(msg)) {
    return 'Could not reach Atlas within 8s. Most often this is Network Access: add your current IP to the cluster allowlist.';
  }
  return msg;
};
