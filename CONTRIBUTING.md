# Contributing to Schedulify

Thank you for your interest in contributing to **Schedulify - AI Integrated Exam Management System**!  
Schedulify is a collaborative, open-source project. Our stack leans heavily on Python, with TypeScript for the frontend and several supporting technologies. We value contributions of all types—from code, documentation, bug reports, and feature requests, to UI/UX improvements.

---

## 🧭 How to Contribute

1. **Fork the Repository**
    - Click “Fork” at the top-right of this repo and clone your fork locally.
    - `git clone https://github.com/hiteshdhr/Schedulify-ai-integrated-exam-management-system.git`

2. **Create a Branch**
    - Follow the naming convention:  
      `feature/your-feature`, `fix/bug-description`, or `docs/update-docs`
    - Example: `git checkout -b feature/chatbot-intent-improvement`

3. **Write Clear, Documented Code**
    - Python: Follow [PEP8](https://peps.python.org/pep-0008/) guidelines.
    - TypeScript: Follow [TSLint](https://palantir.github.io/tslint/) or project linting rules.
    - Add or update docstrings and comments.
    - Write unit tests for new features or bugfixes.

4. **Commit & Push**
    - Use descriptive commit messages (e.g., `fix: resolve exam timetable conflict edge case`).
    - Push your branch: `git push origin your-branch-name`

5. **Open a Pull Request**
    - Go to your fork, select your branch, and click “New pull request.”
    - Reference related issues (e.g., `Closes #123`).
    - Explain your changes and why they’re needed.

---

## 📝 Code Style

- **Python:**  
  - Follow PEP8.
  - Use type hints in new code.
  - Document functions/classes.
- **TypeScript/JavaScript:**  
  - Follow project ESLint/TSLint config.
  - Prefer functional components/hooks in React.
- **Cython/C/C++:**  
  - Ensure code is portable, clear, and well-commented.  
  - Include test cases where practical.

---

## 🏗️ Project Structure

Major directories:
- `/frontend` — React/TypeScript client app
- `/Backend` — Node.js/Express REST API and logic
- `/solver_service` — Python (CP-SAT) microservice
- `/schedulify_chatbot` — Python NLP/chat agent

---

## 🧪 Testing

- Run all tests before submitting a PR.
- For Python: `pytest` or as described in module docs.
- For TypeScript: `npm test` inside `/frontend`.

---

## 🐞 Reporting Bugs / Requesting Features

1. **Search existing [issues](../../issues)** before filing a new bug or feature request.
2. Use a descriptive title and detailed description.
3. If reporting a bug:
    - List steps to reproduce, expected result, and observed result.
    - Include screenshots, logs, or error messages when possible.

---

## 💡 Suggestions

We welcome ideas to improve Schedulify! Please use GitHub Discussions or Issues for brainstorming larger architectural or feature changes.

---

## 📄 Code of Conduct

We are committed to fostering a welcoming, respectful community.  
Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

---

Thanks for your contributions and for making Schedulify better!

— The Schedulify Maintainers  
