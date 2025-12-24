# LicenseChain: Decentralized Licensing & Identity Protocol 🛡️

**LicenseChain** is a robust, blockchain-architected Decentralized Application (dApp) engineered to revolutionize the issuance, lifecycle management, and verification of digital licenses. Leveraging the immutable nature of the **Ethereum** network and the decentralized storage capabilities of **IPFS**, LicenseChain eliminates bureaucratic inefficiencies, mitigates fraud, and ensures absolute data integrity.

> **Academic Dissertation:** Submitted in partial fulfillment of the requirements for the **BSc in Blockchain Technology (2024–2025)** at **Savitribai Phule Pune University**.

---

## 🚀 System Architecture & Capabilities

### 🏛️ Administrative Authority (Governance Node)
* **Cryptographic Issuance:** Deploys tamper-proof licenses as digital assets directly to applicant wallets, establishing a verifiable chain of custody.
* **Immutable Ledger:** All regulatory actions—approvals, rejections, and revocations—are permanently cryptographically signed and recorded on-chain, creating an unalterable audit trail.
* **Decentralized Storage:** Utilizes **IPFS (InterPlanetary File System)** for high-availability, redundancy-free storage of heavy documentation and metadata, ensuring low on-chain gas costs.

### 👤 Applicant Portal (Business/User)
* **Streamlined Onboarding:** A responsive, React-based interface facilitating seamless application submission for diverse license categories (e.g., Trade, Food Safety).
* **Automated Compliance (Auto-Renewal):** Features smart contract-driven logic that autonomously extends license validity upon successful fee processing, ensuring uninterrupted business continuity without manual intervention.
* **Self-Sovereign Ownership:** Licenses are issued as tokens bound to the user's **MetaMask** wallet, granting full ownership and portability of credentials.
* **Real-Time Telemetry:** Provides applicants with instant, transparent status updates (Pending, Approved, Revoked) directly from the blockchain state.

### 🔍 Verification Layer (Public Access)
* **Trustless Verification:** Enables third-party verifiers to instantaneously authenticate license validity via License ID / Registration Number, eliminating the need for centralized intermediaries.
* **Fraud Mitigation:** Instantly flags "Revoked" or expired statuses globally, preventing the circulation of invalid credentials.

---

## 🛠️ Technology Stack

| Domain | Technology / Framework |
| :--- | :--- |
| **Frontend Architecture** | React.js, TypeScript, Vite |
| **Smart Contract Logic** | Solidity (Ethereum Virtual Machine) |
| **Development & Testing** | Truffle Suite** (**Unit Testing**) & Remix IDE (**Prototyping**) |
| **Blockchain Interaction** | Ethers.js (Web3 Provider) |
| **Decentralized Storage** | IPFS (InterPlanetary File System) |
| **Identity Management** | MetaMask (Injected Web3 Wallet) |

---

## ⚙️ Local Development Setup

Follow these instructions to deploy the frontend environment locally.

### 1. Prerequisites
Ensure you have **Node.js** and **npm** installed.

### 2. Clone the Repository
```bash
git clone [https://github.com/yashannadate/LicenseChain-FrontEnd.git](https://github.com/yashannadate/LicenseChain-FrontEnd.git)
cd LicenseChain-FrontEnd
