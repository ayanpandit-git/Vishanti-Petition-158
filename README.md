The Vishanti Petition
A secure, privacy first complaint registration system featuring verifiable status trails and SLA tracking. This is a private hackathon project.

About-
The Vishanti Petition will be a full-stack, secure complaint management web portal designed to allow users to safely report issues while ensuring absolute transparency and data integrity. The website enforces strong privacy features and a verifiable cryptographic audit trail to prevent unauthorized tampering with complaint updates.

Key Intended Features -
User Capabilities -
-Identity Management: Submit detailed complaints either tied to a user or completely anonymously.
-User Dashboard: Track all personal submissions in one personal view.
-Status Tracking: Real-time monitoring of complaint lifecycles across distinct phases: Filed, Assigned, In Review, Resolved. With steps taken by authorities also required if resolved.

Administrative Capabilities -
-Authority Dashboard: High level view of all complaints with the ability to assign tasks to Reviewers.
-Reviewer Workspaces: Dedicated Panels to inspect assigned petitions.
-Enforced Anonymity: Strict access makes sure neither Authorities nor Reviewers can decode the identity of an anonymous submitter.
-Automated SLA Escalation: Automatically elevates complaint priority if Service Level Agreement (SLA) deadlines are missed.

Core Workflows & Security -
Cryptographic Audit Trail -
To protect against database tampering and unauthorized modifications, the system will implement a SHA-256 Hash Chain for tracking state progression:
-Each status update generates a unique SHA-256 cryptographic signature.
-The generated signature incorporates data from the current update combined with the hash of the previous status update.
-This architecture builds a verifiable blockchain-style ledger, guaranteeing any alterations will instantly break the hash chain and flag such a break in continuity.

Tech Stack -
-Frontend: React.js (Component-driven User Interfaces)
-Backend: FastAPI (High-performance, asynchronous Python Web API framework)
-Database: MySQL 8.4 (Relational Database Management System)

Current Status -
This repository hosts a private project developed for a hackathon. The system is currently under development.
