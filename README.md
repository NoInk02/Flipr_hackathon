# AI-Powered Customer Support Platform Framework

## Overview

This framework provides a smarter, AI-driven solution to transform customer support operations by leveraging:

- **Retrieval-Augmented Generation (RAG)** with Google Gemini via API keys  
- **Company-specific knowledge bases** extracted from company documents (PDF → JSON)  
- **Semantic search** using ChromaDB embeddings for fast, relevant answers  
- **Emotion detection** to personalize chatbot responses and enable deeper analytics  
- **Automated ticket creation and intelligent agent assignment** to balance workloads  
- **Agent chatbot assistant** with access to company data and ongoing tickets  
- **Feedback collection and CSAT (Customer Satisfaction) analysis** powered by AI  
- **Admin dashboard** for real-time analytics, performance tracking, and insights  

---

## Files description

- **`company_data.pdf`**
  Contains dummy data of a delivery company 

---

## Architecture Overview for chatbot

```Text
 User Input
    │
    ▼
[Emotion Detection] ◄────────────┐
    │                            │
    ▼                            │
[Query Embedding]                │
    │                            │
    ▼                            │
[Semantic Search in ChromaDB]    │
    │                            │
    ▼                            │
[Build Gemini Prompt with Context & Emotion]
    │
    ▼
[Gemini 1.5 Flash Response]
    │
    ▼
[Log to Session File]
    │
    ▼
[Feedback Prompt (manual or Gemini-generated)]
```

---

## System Workflow

1. **Company Registration & Document Upload**  
   Companies register on the platform and upload relevant documents (e.g., manuals, FAQs, policy PDFs). These are converted into structured JSON to build a custom knowledge base.

2. **Knowledge Base Updates**  
   Companies can regularly update their documents and synchronize the knowledge base to keep information fresh.

3. **Client-Side Chatbot with RAG**  
   Customers interact with a chatbot powered by Google Gemini. The chatbot uses semantic search (ChromaDB) on company-specific data to provide accurate, contextual answers.

4. **Emotion Detection**  
   The chatbot detects user emotions during conversations, adjusting its tone for politeness and collecting emotion data for analytics.

5. **Issue Escalation & Ticketing**  
   If the chatbot cannot resolve an issue, users can raise support tickets. Tickets are assigned to the least busy available agent via an intelligent load balancing algorithm.

6. **Agent Interface**  
   Agents can view tickets, access AI-generated suggestions on relevant documents, and chat with an internal assistant bot that has access to company data and historical tickets.

7. **Feedback & CSAT Analytics**  
   After each chat session, users can optionally provide feedback and ratings. The system uses AI to generate summarized feedback and analyzes scores over time to suggest chatbot improvements.

8. **Admin Dashboard**  
   Provides visualization of chatbot performance metrics, CSAT trends, emotion distributions, and agent workload.

---

## Key Components & Technologies

- **Document Conversion:** PDF → JSON for company knowledge ingestion  
- **Semantic Search:** SentenceTransformers + ChromaDB vector store  
- **Language Model:** Google Gemini via API keys for conversation and feedback generation  
- **Emotion Detection:** Pretrained emotion classification model integrated into chat  
- **Ticketing System:** Automated ticket creation with smart agent assignment  
- **Feedback Module:** Collects and summarizes user feedback leveraging AI  
- **CSAT Analysis:** Aggregates session ratings to provide actionable insights  

---

## Required Files to Run the System

- `company_data.pdf` — Company documents to be converted and indexed  
- `sample_ticket.json` — Example ticket structure for testing ticketing workflows  

---

## How to Use

### For Companies (Admins)

1. Register on the platform and upload company documents.  
2. Manage and update your knowledge base regularly.  
3. Monitor chatbot and agent performance via the admin dashboard.

### For Customers

- Interact with the chatbot to get answers based on your company’s data.  
- Raise a support ticket if your issue is unresolved.  
- Optionally provide feedback to help improve service quality.

### For Agents

- View and manage tickets assigned by the system.  
- Use the AI-powered assistant chatbot to quickly access relevant info and past ticket data.  
- Collaborate to resolve user issues efficiently.

---

## Tech Stack

### Backend & Core Logic
- **Python** — Main language for chatbot logic, feedback processing, ticketing, and analytics.
- **Google Generative AI (Gemini) API** — Used for chatbot responses (RAG), feedback summarization, and CSAT analysis.

### Data Storage & Vector Search
- **ChromaDB** — Vector database to store document embeddings and perform semantic search.
- **JSON Files** — For storing company documents, chat sessions, feedback, and tickets.
- **MongoDB** 

### Document Processing
- **PDF to JSON conversion tools** (PyMuPDF) — Extract company documents into structured JSON for chatbot knowledge base.

### Emotion Detection
- **Pretrained Emotion Classification Model** — Detects user emotions from chat inputs to enable adaptive responses and analytics(from hugging face).

### Web / Frontend

- **Next.js** — React-based framework used for building the frontend UI with server-side rendering and API routes.  
- **Tailwind CSS** — Utility-first CSS framework for styling and responsive design.  

---

### Analytics & Data Processing
- Python `statistics` module — Computes CSAT scores and other metrics.
- File I/O for JSON data handling.

---

## Setup & Configuration

  1. Navigate to the `supportflow` directory.  
  2. Run `npm i` to install dependencies.  
  3. Create a `.env.local` file in the same directory as `package.json` with the required environment variables (see example `.env.local.example` if provided).  
  4. Run `npm run dev` to start the development server.  
- For other available commands and modes, please check the `package.json` file in the `supportflow` directory.
 
--

## Additional Features (Located in `other_files/` Folder)

We have also developed several supplementary modules that enhance feedback collection, CSAT analysis, and real-time analytics visualization. These are currently standalone due to time constraints but represent key planned capabilities for future integration.

### Files and Descriptions

- **`feedback.py`**  
  Runs when a user closes the chat window to prompt for feedback. It sends the entire chat history plus any user feedback to Google Gemini via API to generate a summarized human experience report.

- **`feedback_test.py`**  
  Contains test cases for validating the functionality of `feedback.py`.

- **`feedback.json`**  
  Stores automatically generated feedback data after running `feedback.py` (example data included).

- **`session.json`**  
  Contains the full chat session history for which feedback is to be created.

- **`csat.py`**  
  Processes input from `feedback.json` and `session.json` to generate a summarized customer satisfaction analysis file named `session_analysis.json`.

- **`session_analysis.json`**  
  Example output from `csat.py` containing CSAT analytics data.

- **`analytics.py`**  
  Utilizes `session_analysis.json` data to generate graphs and visualizations that can be served to the frontend for real-time dashboard updates.

### Current Status

These modules have been implemented and tested individually but have not yet been fully integrated into the main platform workflow due to time limitations. These files can be used to implement these features into the core system, enabling enhanced feedback loops, CSAT analytics, and live administrative insights.


## Future Enhancements

- Multi-language support  
- Real-time agent availability tracking  
- Deeper integration with external ticketing platforms  
- Agents can be informed upon ticket assignment using nodemailer

---

## Summary

This platform framework empowers any company to deploy an AI-powered customer support system tailored to their unique documents and customer interactions. By combining state-of-the-art NLP, emotion detection, and intelligent ticketing, it delivers faster, more empathetic, and scalable support solutions.

---

*Powered by Google Gemini, ChromaDB, and cutting-edge AI technology.*
