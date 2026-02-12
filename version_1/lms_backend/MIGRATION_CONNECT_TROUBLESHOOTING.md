# Migration connect ETIMEDOUT / ER_NET_READ_INTERRUPTED

If `npm run db:migrate` fails with **connect ETIMEDOUT** or **Got timeout reading communication packets**, the app cannot reach the MySQL server. Check the following.

## 1. `.env` database settings

In `version_1/lms_backend/.env` you must have:

- **DB_HOST** – MySQL server host
- **DB_PORT** – usually `3306`
- **DB_USERNAME** – MySQL user
- **DB_PASSWORD** – MySQL password
- **DEFAULT_DB** – database name (e.g. `digitalt3_lms`)

## 2. Local MySQL (development)

If you run MySQL **on your machine**:

1. **Start MySQL** (e.g. from XAMPP, WAMP, or as a Windows service).
2. In `.env` use:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=your-local-password
   DEFAULT_DB=digitalt3_lms
   ```
3. **Disable SSL** for local MySQL (no RDS):
   ```env
   DB_SSL=false
   ```
4. Create the database if it doesn’t exist:
   ```sql
   CREATE DATABASE IF NOT EXISTS digitalt3_lms;
   ```

## 3. Remote MySQL (e.g. AWS RDS)

If **DB_HOST** is a remote host (e.g. RDS):

- Ensure you’re on a network that can reach it (VPN, correct VPC/security group).
- Ensure **port 3306** is open (no firewall blocking it).
- If you use RDS, keep **DB_SSL=true** and optionally set **DB_SSL_CA_PATH** to your RDS CA bundle.

## 4. Quick connectivity test

From the backend folder you can test the connection (without running migrations):

```bash
node scripts/verify-db-connection.js
```

If that script also times out, the problem is network/MySQL reachability or `.env`, not the migration code.

## Summary

| Symptom              | Likely cause                    | Action                                      |
|----------------------|----------------------------------|---------------------------------------------|
| `connect ETIMEDOUT`  | Can’t reach host / MySQL off     | Fix DB_HOST, start MySQL, check firewall    |
| Local dev            | SSL to local MySQL               | Set `DB_SSL=false` in `.env`                |
| Remote (RDS)         | Network / VPN / security group   | Connect to correct network, open port 3306  |
