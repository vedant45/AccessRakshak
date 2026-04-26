# 🛡️ Sentari
> Governance Intelligence Platform for OpenMetadata

Sentari brings IAM governance concepts (SOD policies, access certifications, ownership delegation) to data asset management in OpenMetadata.

## 🎯 Problem

OpenMetadata's governance policies silently fail in real-world scenarios:
- DENY rules with `isOwner()` don't propagate to child GlossaryTerms ([Bug #25508](https://github.com/open-metadata/OpenMetadata/issues/25508))
- Assets owned only by `admin` — single point of failure
- No tooling to detect, delegate, or certify data asset ownership

## 🚀 Commands

```bash
# Scan for governance misconfigurations
npm run audit

# Preview auto-delegation (dry run)
npm run delegate -- --dry-run

# Auto-assign owners based on rules
npm run delegate

# Run access certification report
npm run certify
```

## 🔄 Full Governance Lifecycle

```
npm run audit       →  Detect misconfigurations
npm run delegate    →  Auto-assign owners by rules
npm run audit       →  Verify fixes
npm run certify     →  Certify ownership is valid
```

## ⚙️ Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- A running OpenMetadata instance (local or cloud)
- [ngrok](https://ngrok.com/download) — if tunneling a local backend
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) — optional, for a stable public URL

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/vedant45/sentari
cd sentari
npm install
```

---

### Step 2 — Start OpenMetadata via Docker

If you don't have an OpenMetadata instance running yet:

```bash
docker compose up -d
```

Wait for it to be healthy at `http://localhost:8585`.  
Default credentials: `admin / admin`

---

### Step 3 — Configure Environment Variables
Use the env file given
```

> ⚠️ If using Cloudflare Tunnel, replace `OPENMETADATA_URL` with your tunnel URL:
> ```env
> OPENMETADATA_URL=https://your-tunnel.trycloudflare.com
> ```

---
### Step 4 — Run the Backend

```bash
npm run backend
```

To expose it publicly via ngrok:

```bash
ngrok http 8080
```

Copy the forwarding URL and update your `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-ngrok-url.ngrok-free.app/api/:path*"
    },
    {
      "source": "/ws",
      "destination": "https://your-ngrok-url.ngrok-free.app/ws"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "ngrok-skip-browser-warning",
          "value": "true"
        }
      ]
    }
  ]
}
```

> ⚠️ Replace `your-ngrok-url.ngrok-free.app` with your actual ngrok forwarding URL each time you restart ngrok.

### Step 5 — Run Sentari

```Login https://sentari.vercel.app/
```

---



---


## 🏆 Built For

[OpenMetadata Hackathon](https://wemakedevs.org) — Governance & Classification Track
