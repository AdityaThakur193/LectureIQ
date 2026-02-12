# Fix Container Restarts During Processing

## The Problem

Your logs show the container restarts at **12:55:54** while processing that started at **12:55:39** (15 seconds later).

**Why:** Processing blocks the API for 1-2 minutes → Health checks fail → Platform restarts container

## The Solution

### Configure Your Deployment Platform

You MUST increase health check settings on your deployment platform:

#### **Render.com**
In your service settings:
- Health Check Path: `/health`
- Health Check Interval: `120` seconds
- Health Check Timeout: `60` seconds

#### **Railway.app**  
In your service settings or `railway.toml`:
```toml
[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 60
restartPolicyType = "ON_FAILURE"
```

#### **Vercel / Other platforms**
If using serverless, you need to set function timeout:
- Function timeout: `300` seconds (5 minutes)

### Without Platform Access?

If you can't change health check settings, the **only** solution is async processing with polling (which you previously rejected).

## Current Setup

- Backend timeout: Increased to 300 seconds
- Processing time: 60-120 seconds typical
- Health check: Must not timeout during processing

## Test It

After configuring health checks:
1. Upload a lecture
2. Watch backend logs  
3. You should see ONE server start, not multiple
4. Processing completes without restart

## Still Having Issues?

The platform is killing your container because health checks fail. You must either:
1. ✅ Increase health check timeout (recommended)
2. ✅ Use async processing with status polling
3. ❌ Accept container restarts (not viable)

**Current approach won't work without option 1 or 2.**
