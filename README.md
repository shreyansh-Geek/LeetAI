# GenAI-Powered Intelligent Course Builder and Personalized Tutor

<div align="center">

[![Frontend](https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js)]()
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)]()
[![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)]()
[![Vector Database](https://img.shields.io/badge/Vector%20Database-Qdrant-red?style=for-the-badge)]()
[![LLM](https://img.shields.io/badge/LLM-Google%20Gemini-4285F4?style=for-the-badge&logo=google)]()
[![Architecture](https://img.shields.io/badge/Architecture-RAG-orange?style=for-the-badge)]()
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)]()

**An AI-driven adaptive learning platform that automatically constructs personalized learning roadmaps, curates high-quality educational resources, generates study materials, and provides a context-aware tutor using Retrieval-Augmented Generation (RAG).**

</div>

---

## Table of Contents

- [Introduction](#introduction)
- [Problem Statement](#problem-statement)
- [Project Objectives](#project-objectives)
- [Core Features](#core-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [System Workflow](#system-workflow)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Example Use Case](#example-use-case)
- [Future Enhancements](#future-enhancements)
- [Contributors](#contributors)
- [Acknowledgements](#acknowledgements)
- [License](#license)

---

## Introduction

The exponential growth of online educational content has fundamentally transformed how people learn. Platforms such as YouTube, Coursera, Udemy, blogs, and MOOCs provide unprecedented access to high-quality educational material. However, this abundance of information introduces significant challenges:

- Educational resources are fragmented and unstructured.
- Learners struggle to determine the optimal sequence of topics.
- Existing courses are largely static and designed for broad audiences.
- Personalized guidance is limited.
- Learners lack integrated tutoring support aligned with their chosen materials.

This project addresses these limitations by combining Generative AI, semantic search, intelligent ranking, and Retrieval-Augmented Generation (RAG) to create a unified adaptive learning system.

The platform performs two complementary roles:

1. **Intelligent Course Builder** — Designs a structured, time-bound, and goal-oriented learning roadmap.
2. **Personalized AI Tutor** — Answers learner questions using only the curated course materials.

---

## Problem Statement

Despite the abundance of freely available learning resources, there is no unified system capable of automatically generating a personalized, structured, and goal-oriented course roadmap while simultaneously providing context-aware tutoring based on the same curated materials.

Learners frequently encounter:

- Information overload
- Unstructured content discovery
- Difficulty evaluating resource quality
- Lack of personalized course planning
- Absence of grounded tutoring support

The objective of this project is to solve these problems through an end-to-end GenAI-powered learning platform.

---

## Project Objectives

The primary objectives of the system are:

1. Conversational requirement gathering using natural language.
2. Automatic discovery of educational resources via YouTube Data API and web sources.
3. Multi-factor ranking using semantic similarity, engagement, recency, and channel credibility.
4. Personalized week-wise course generation.
5. AI-generated study materials, including summaries, notes, flashcards, and quizzes.
6. Context-aware tutoring using Retrieval-Augmented Generation (RAG).
7. Full-stack implementation using modern web technologies.

---

## Core Features

### Conversational Requirement Gathering
- Natural language goal input
- Intelligent follow-up questions
- Structured learner profile creation

### Resource Discovery
- YouTube Data API integration
- Retrieval of educational blogs and articles
- Metadata extraction and preprocessing

### Intelligent Ranking Pipeline
- Embedding-based semantic similarity
- Engagement and popularity scoring
- Recency analysis
- Channel reputation weighting

### Personalized Course Structuring
- Weekly and module-based roadmap generation
- Topic sequencing and dependency planning
- Time estimation per module

### Learning Material Generation
- Concise notes and summaries
- Flashcards for revision
- Multiple-choice quizzes
- Assignments and project suggestions

### RAG-Based Personalized Tutor
- Vector database indexing
- Retrieval of relevant course content
- Grounded and context-specific responses

### Interactive Learning Dashboard
- Collapsible course modules
- Ranked resources with metadata
- Integrated tutor interface

---

## System Architecture

```text
Learner
   │
   ▼
Next.js Frontend
(Chat Interface and Dashboard)
   │
   ▼
FastAPI Backend
   ├── Requirement Processor
   ├── Resource Discovery Engine
   ├── Ranking Engine
   ├── Course Planner
   ├── Material Generator
   └── RAG Tutor Engine
          │
          ├── Google Gemini / OpenAI
          ├── YouTube Data API
          ├── MongoDB Atlas
          └── Qdrant / ChromaDB
```

---

## Technology Stack

### Frontend
- Next.js
- React.js
- TypeScript
- Tailwind CSS

### Backend
- FastAPI
- Python
- LangChain

### Databases
- MongoDB Atlas
- Qdrant / ChromaDB

### Artificial Intelligence
- Google Gemini API
- OpenAI API
- Sentence Transformers
- Embeddings
- Retrieval-Augmented Generation (RAG)

### External APIs
- YouTube Data API v3

### Deployment
- Vercel
- Render
- Docker (optional)

---

## System Workflow

1. The learner specifies a learning goal in natural language.
2. The AI generates follow-up questions to gather constraints and preferences.
3. A structured learner profile is created.
4. Relevant videos and articles are discovered automatically.
5. Resources are ranked using semantic and quality metrics.
6. A personalized multi-week roadmap is generated.
7. Notes, flashcards, and quizzes are produced.
8. Course materials are embedded and stored in a vector database.
9. The RAG tutor answers questions using retrieved course content.

---

## Project Structure

```text
genai-course-builder/
│
├── frontend/                  # Next.js application
│   ├── app/
│   ├── components/
│   └── styles/
│
├── backend/                   # FastAPI services
│   ├── api/
│   ├── services/
│   ├── models/
│   ├── utils/
│   └── main.py
│
├── rag/
│   ├── embeddings/
│   ├── retriever/
│   └── tutor_engine.py
│
├── data/
├── docs/
├── tests/
├── requirements.txt
├── .env.example
└── README.md
```

---

## Installation and Setup

### Clone the Repository

```bash
git clone https://github.com/yourusername/genai-course-builder.git
cd genai-course-builder
```

### Backend Setup

```bash
cd backend
python -m venv venv

# Linux/macOS
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Start the Backend Server

```bash
uvicorn main:app --reload
```

---

## Environment Variables

Create a `.env` file in the project root with the following values:

```env
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
YOUTUBE_API_KEY=your_youtube_api_key
MONGODB_URI=your_mongodb_connection_string
QDRANT_URL=your_qdrant_endpoint
JWT_SECRET=your_jwt_secret
```

---

## API Endpoints

| Method | Endpoint | Description |
|------|------|------|
| POST | `/api/chat/start` | Start conversational onboarding |
| POST | `/api/chat/followup` | Process follow-up responses |
| POST | `/api/course/generate` | Generate personalized course |
| GET | `/api/course/{course_id}` | Retrieve course details |
| POST | `/api/tutor/ask` | Ask the personalized tutor |
| GET | `/api/quiz/{module_id}` | Retrieve quizzes for a module |

---

## Example Use Case

### Input

> I want to learn Deep Learning for Computer Vision in 6 weeks. I know basic Python and Linear Algebra.

### Generated Roadmap

- Week 1: Neural Network Fundamentals
- Week 2: Convolutional Neural Networks
- Week 3: Advanced CNN Architectures
- Week 4: Transfer Learning
- Week 5: Object Detection
- Week 6: Final Project and Deployment

### Tutor Interaction

> **Question:** What is the difference between convolutional layers and fully connected layers?

**Response:** A grounded explanation generated exclusively from the learner's curated course materials.

---

## Future Enhancements

- Mobile application support
- Multi-language content generation
- Learning analytics and progress tracking
- Voice-enabled tutoring
- Certification generation
- Collaborative classroom features
- Reinforcement learning for adaptive curriculum optimization

---

## Contributors

| Name | Contribution |
|------|------|
| Shreyansh Pandit | Full-Stack Development, AI Integration, Frontend Development, User Interface Design |
| Yash Dadlani | Backend Development, API Integration |
---

## Acknowledgements

The author would like to acknowledge:

- Google Gemini
- OpenAI
- LangChain
- MongoDB Atlas
- Qdrant
- YouTube Data API

---

## License

The source code may be used, modified, and distributed under the terms of the MIT License.

---

<div align="center">

If this project is helpful to your work, please consider starring the repository.

</div>
