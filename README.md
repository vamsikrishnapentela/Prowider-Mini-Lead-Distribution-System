# Prowider Mini Lead Distribution System

## Technology Stack
- **Frontend**: Next.js (React)
- **Backend**: Next.js API Routes (Node.js)
- **Database**: MongoDB Atlas via Mongoose
- **Styling**: Modern Vanilla CSS (No external UI libraries)

## Features & Implementation Highlights

### 1. Allocation Algorithm & Concurrency
The allocation system ensures exactly 3 providers are chosen per lead, guaranteeing fairness and respecting quotas.
- **Mandatory Assignment**: It first attempts to assign to mandatory providers based on the service rules. Atomic `findOneAndUpdate` ensures quotas are safely checked and incremented without race conditions.
- **Fair Allocation (Round Robin)**: For the remaining slots, the system uses a `RotationState` model specific to each service.
  - To pick the next provider, it atomically increments `operationCount` using `findOneAndUpdate`. This returns a sequential index even under heavy concurrency.
  - Using modulo `(index % fairPool.length)`, we select a candidate provider.
  - If the candidate provider is full or already assigned, it skips them and tries the next index. This gracefully handles quota exhaustion.
- **Concurrency**: Because the rotation index is updated atomically and independently of the provider's quota, thousands of simultaneous requests can correctly rotate through the fair pool without corrupting the state or double-booking quotas.

### 2. Idempotent Webhooks
Webhook processing handles resets (simulating successful payments).
- **Idempotency Key**: The webhook requires an `idempotencyKey`. It creates an `IdempotencyKey` document with a unique index.
- If multiple identical webhook calls occur simultaneously, MongoDB's unique index throws a `11000` Duplicate Key Error on the second attempt. The application catches this and safely ignores the duplicate request.
- Quotas are reset safely after the idempotency check passes.

### 3. Duplicate Detection
- A unique compound index `{ phone: 1, serviceId: 1 }` is applied at the database level.
- Phone numbers are stripped of non-digit characters before saving to ensure standardized formatting.
- This prevents the exact same phone number from creating multiple leads for the exact same service, even if submitted simultaneously.

### 4. Real-Time Dashboard
- The provider dashboard polls the backend every 3 seconds to fetch updated provider stats and lead assignments.
- This creates a real-time experience that functions across tabs without needing manual refreshes.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

### Initial Setup
Before testing, navigate to the **Test Tools** page and click **1. Run Database Seed** to load the initial Services and Providers.

## Live Demo
Run the app locally or deploy it to Vercel instantly by connecting your GitHub repository.
