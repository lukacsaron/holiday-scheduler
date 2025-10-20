# Deployment Guide for Holiday Scheduler

## Quick Deploy to Coolify

### Prerequisites
- Git repository (GitHub, GitLab, Bitbucket, etc.)
- Coolify instance running

### Steps

1. **Push your code to Git**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create a new Application in Coolify**
   - Go to your Coolify dashboard
   - Click "New Resource" → "Application"
   - Select your Git repository
   - Branch: `main` (or your default branch)

3. **Configure the Application**
   - **Build Pack**: Docker
   - **Port**: `3001`
   - **Dockerfile**: `Dockerfile` (default, already in root)

4. **Add Persistent Storage**
   - Go to "Storages" tab
   - Add new volume:
     - **Source**: `/app/server/data`
     - **Destination**: Create a new volume named `holiday-scheduler-db`
   - This ensures your SQLite database persists across deployments

5. **Environment Variables** (Optional)
   If you want to customize:
   - `PORT`: `3001` (default)
   - `NODE_ENV`: `production`

6. **Deploy**
   - Click "Deploy" button
   - Coolify will:
     - Clone your repository
     - Build the Docker image
     - Run the container
     - Expose it on your domain

7. **Access Your App**
   - Coolify will provide you with a URL
   - Your app will be available at `https://your-app.your-domain.com`

## Docker Compose (Alternative)

If you prefer to deploy using Docker Compose:

```bash
# Clone the repository
git clone <your-repo-url>
cd holiday-scheduler

# Build and start
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

## Environment Variables

### Production
No environment variables are required for basic deployment. The app uses sensible defaults:
- Port: 3001
- Database: SQLite at `/app/server/data/polls.db`

### Development
Create a `.env` file:
```bash
VITE_API_URL=http://localhost:3001
PORT=3001
NODE_ENV=development
```

## Database Persistence

The SQLite database is stored at `/app/server/data/polls.db`.

**Important**: Mount this directory as a volume to persist data across container restarts:
- Docker Compose: Already configured in `docker-compose.yml`
- Coolify: Add persistent storage as described above
- Manual Docker: Use `-v` flag: `docker run -v ./data:/app/server/data`

## Backup

To backup your polls:

```bash
# If using Docker Compose
docker-compose exec holiday-scheduler cp /app/server/data/polls.db /app/server/data/polls-backup.db

# If using manual Docker
docker exec holiday-scheduler cp /app/server/data/polls.db /app/server/data/polls-backup.db

# Copy backup to host
docker cp holiday-scheduler:/app/server/data/polls-backup.db ./polls-backup.db
```

## Monitoring

Health check endpoint: `GET /health`

Returns:
```json
{
  "status": "ok",
  "timestamp": 1234567890
}
```

## Scaling Considerations

This is a single-instance application due to SQLite. For high-traffic scenarios, consider:
- Migrating to PostgreSQL/MySQL
- Using a distributed database
- Implementing Redis for session storage

## Troubleshooting

### App won't start
- Check logs: `docker logs <container-name>`
- Ensure port 3001 is not in use
- Verify volume permissions

### Database not persisting
- Ensure volume is properly mounted
- Check Coolify storage configuration
- Verify `/app/server/data` has write permissions

### Can't access the app
- Check firewall rules
- Verify port mapping (3001:3001)
- Check reverse proxy configuration in Coolify

## Support

For issues, check:
1. Container logs
2. Database file exists at `/app/server/data/polls.db`
3. Health endpoint responds: `curl http://localhost:3001/health`
