# MongoDB & Mongoose Index Fix Guide

This guide helps you fix duplicate index warnings and MongoDB authentication issues.

---

## 🔧 Problem Summary

### 1. Duplicate Index Warnings
```
[MONGOOSE] Warning: Duplicate schema index on {"email":1}
[MONGOOSE] Warning: Duplicate schema index on {"expiresAt":1}
```

**Cause:** Indexes were defined both inline in schema AND using `schema.index()`.

### 2. MongoDB Authentication Failed
```
MongoServerError: bad auth : Authentication failed.
```

**Cause:** Incorrect MongoDB URI format or wrong credentials.

---

## ✅ Fixes Applied

### Fixed Schemas

#### 1. User/Account Schema (auth.schema.ts)
**Before (WRONG):**
```typescript
const authSchema = new Schema<TAccount>({
    email: { type: String, required: true, unique: true }, // ❌ Inline unique
    // ...
});
authSchema.index({ email: 1 }, { unique: true }); // ❌ Duplicate!
```

**After (CORRECT):**
```typescript
const authSchema = new Schema<TAccount>({
    email: { type: String, required: true }, // ✅ No inline index
    // ...
});
authSchema.index({ email: 1 }, { unique: true }); // ✅ Single definition
```

#### 2. Token Blacklist Schema (token_blacklist.schema.ts)
**Before (WRONG):**
```typescript
const tokenBlacklistSchema = new Schema<ITokenBlacklist>({
    token: { type: String, required: true, unique: true, index: true }, // ❌
    expiresAt: { type: Date, required: true, index: { expires: 0 } },   // ❌
});
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // ❌ Duplicate!
```

**After (CORRECT):**
```typescript
const tokenBlacklistSchema = new Schema<ITokenBlacklist>({
    token: { type: String, required: true }, // ✅ No inline index
    expiresAt: { type: Date, required: true }, // ✅ No inline index
});
tokenBlacklistSchema.index({ token: 1 }, { unique: true }); // ✅
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // ✅
```

---

## 🗄️ MongoDB Shell Commands

### Connect to MongoDB

**Local MongoDB:**
```bash
mongosh mongodb://localhost:27017/your_database_name
```

**MongoDB Atlas:**
```bash
mongosh "mongodb+srv://username:password@cluster.mongodb.net/your_database_name"
```

### List All Indexes

```javascript
// Show all collections
show collections

// List indexes for a specific collection
db.account.getIndexes()
db.token_blacklists.getIndexes()
db.users.getIndexes()

// List indexes for all collections (script)
db.getCollectionNames().forEach(collection => {
    print(`\n=== ${collection} ===`);
    printjson(db.getCollection(collection).getIndexes());
});
```

### Drop Duplicate Indexes

```javascript
// Drop specific index by name
db.account.dropIndex("email_1")
db.token_blacklists.dropIndex("expiresAt_1")

// Drop ALL indexes (except _id) - CAUTION!
db.account.dropIndexes()
db.token_blacklists.dropIndexes()

// Drop duplicate indexes programmatically
db.account.getIndexes().forEach(index => {
    if (index.name.includes("email") || index.name.includes("expiresAt")) {
        print("Dropping: " + index.name);
        db.account.dropIndex(index.name);
    }
});
```

### Recreate Indexes Correctly

```javascript
// Account collection indexes
db.account.createIndex({ email: 1 }, { unique: true })
db.account.createIndex({ accountStatus: 1 })
db.account.createIndex({ role: 1 })
db.account.createIndex({ twoFactorEnabled: 1 })
db.account.createIndex({ email: 1, isDeleted: 1 })
db.account.createIndex({ email: 1, accountStatus: 1 })
db.account.createIndex({ email: 1, twoFactorEnabled: 1 })
db.account.createIndex({ verificationCodeExpires: 1 }, { expireAfterSeconds: 0 })
db.account.createIndex({ resetPasswordExpire: 1 }, { expireAfterSeconds: 0 })

// Token blacklist collection indexes
db.token_blacklists.createIndex({ token: 1 }, { unique: true })
db.token_blacklists.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

### Verify Indexes

```javascript
// Check indexes after recreation
db.account.getIndexes()
db.token_blacklists.getIndexes()

// Check index stats
db.account.aggregate([{ $indexStats: {} }])
```

---

## 🔐 MongoDB URI Formats

### Local MongoDB (No Auth)
```
mongodb://localhost:27017/database_name
```

### Local MongoDB (With Auth)
```
mongodb://username:password@localhost:27017/database_name?authSource=admin
```

### MongoDB Atlas
```
mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

### URL Encoding Special Characters

If your password contains special characters, encode them:

| Character | Encoded |
|-----------|---------|
| @         | %40     |
| :         | %3A     |
| /         | %2F     |
| #         | %23     |
| ?         | %3F     |
| &         | %26     |
| =         | %3D     |
| +         | %2B     |
| space     | %20     |

**Example:**
- Password: `my@password+123`
- Encoded: `my%40password%2B123`
- Full URI: `mongodb://user:my%40password%2B123@localhost:27017/mydb`

---

## 🧪 Testing Connection

### Test Local MongoDB
```bash
# Without authentication
mongosh mongodb://localhost:27017/trading_app

# With authentication
mongosh "mongodb://trading_app:your_password@localhost:27017/trading_app?authSource=admin"
```

### Test MongoDB Atlas
```bash
mongosh "mongodb+srv://trading_app:your_password@reazuldev.622ztb7.mongodb.net/trading_app?retryWrites=true&w=majority"
```

---

## 📋 Best Practices

### Mongoose Index Best Practices

1. **Define indexes explicitly using `schema.index()`** - Don't mix inline and explicit
2. **Use compound indexes for multi-field queries**
3. **TTL indexes for auto-expiry** - Use `expireAfterSeconds`
4. **Background index creation** - Use `background: true` for production
5. **Name indexes explicitly** - For easier management

```typescript
// ✅ GOOD
const schema = new Schema({
    email: { type: String },
    status: { type: String }
});
schema.index({ email: 1 }, { unique: true, name: 'email_unique' });
schema.index({ email: 1, status: 1 }, { background: true });

// ❌ BAD
const schema = new Schema({
    email: { type: String, unique: true, index: true },
    status: { type: String, index: true }
});
schema.index({ email: 1 }); // Duplicate!
```

### MongoDB Authentication Best Practices

1. **Use environment variables** - Never hardcode credentials
2. **Use strong passwords** - At least 16 characters
3. **URL-encode special characters** - In passwords
4. **Use authSource parameter** - Specify authentication database
5. **Use connection pooling** - For production performance
6. **Implement retry logic** - For transient failures

### Production Database Configuration

```typescript
// Connection pool settings
maxPoolSize: 10,      // Max connections
minPoolSize: 5,       // Min connections
maxIdleTimeMS: 30000, // Close idle connections

// Timeout settings
socketTimeoutMS: 45000,
connectTimeoutMS: 20000,
serverSelectionTimeoutMS: 5000,

// Reliability
retryWrites: true,
retryReads: true,
w: 'majority'  // Write concern
```

---

## 🚀 Quick Start After Fixes

1. **Update your .env file:**
```env
# For local MongoDB without auth
DB_URL=mongodb://localhost:27017/trading_app

# For local MongoDB with auth
DB_URL=mongodb://trading_app:your_password@localhost:27017/trading_app?authSource=admin

# For MongoDB Atlas
DB_URL=mongodb+srv://trading_app:your_password@reazuldev.622ztb7.mongodb.net/trading_app?retryWrites=true&w=majority
```

2. **Clean up existing duplicate indexes (if any):**
```bash
mongosh mongodb://localhost:27017/trading_app
```
```javascript
db.account.dropIndexes()
db.token_blacklists.dropIndexes()
```

3. **Start the server:**
```bash
npm run dev
```

4. **Verify no warnings:**
```
✅ Database connected successfully
🚀 Server started on port 5000
```

---

## 🔍 Troubleshooting

### Still Getting Authentication Failed?

1. **Verify credentials:**
```bash
# Test connection manually
mongosh "mongodb://username:password@localhost:27017/dbname?authSource=admin"
```

2. **Check MongoDB user exists:**
```javascript
// In mongosh
use admin
db.getUsers()
```

3. **Create user if needed:**
```javascript
use admin
db.createUser({
    user: "trading_app",
    pwd: "your_secure_password",
    roles: [
        { role: "readWrite", db: "trading_app" },
        { role: "dbAdmin", db: "trading_app" }
    ]
})
```

4. **Check MongoDB is running:**
```bash
# Linux/Mac
sudo systemctl status mongod

# Windows
net start | findstr MongoDB
```

### Still Getting Duplicate Index Warnings?

1. **Drop all indexes and restart:**
```javascript
db.account.dropIndexes()
db.token_blacklists.dropIndexes()
// Restart server - Mongoose will recreate indexes
```

2. **Check schema files for inline indexes:**
```bash
# Search for inline index definitions
grep -r "unique: true" src/app/modules/
grep -r "index: true" src/app/modules/
grep -r "index: {" src/app/modules/
```

---

## 📚 Additional Resources

- [Mongoose Indexes Documentation](https://mongoosejs.com/docs/indexes.html)
- [MongoDB Index Documentation](https://www.mongodb.com/docs/manual/indexes/)
- [MongoDB Connection String Format](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
