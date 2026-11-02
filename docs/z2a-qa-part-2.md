# Zero to Agents (Part 2): QA/Testers

**Audience:** QA engineers and testers  
**Focus:** Agentic testing workflows, reusable QA standards, and Playwright MCP  
**Demo repository:** [yortch/agentic-devops-demo](https://github.com/yortch/agentic-devops-demo)

## Session Setup

Start from the repository's `main` branch:

```bash
git clone https://github.com/yortch/agentic-devops-demo.git
cd agentic-devops-demo
git switch main
```

For the live demos, ensure Java 17, Maven, Node.js, and npm are installed. Install the frontend and test dependencies and Playwright browser binaries before the session if possible.

## 3-4. Agentic Testing Workflows and Reusable QA Standards

**Demo goal:** Use reusable QA guidance to move from test discovery and planning to test implementation, then iterate based on test and coverage results.

### Demo Sequence

1. Open the [Awesome Copilot skills repository](https://github.com/github/awesome-copilot/tree/main/skills/) and show that testing guidance can be installed and reused across projects. Point out that teams can encode conventions such as test naming, arrange-act-assert structure, mocking boundaries, and coverage expectations in a skill or custom agent.

2. Install the Java/JUnit skill. Prompt:

   > Install the java-junit skill from awesome-copilot: https://github.com/github/awesome-copilot/tree/main/skills/java-junit

3. Confirm Copilot can apply project-aware testing guidance. Prompt:

   > What is the JUnit version used in the backend project?

   **Presenter check:** The project uses `spring-boot-starter-test` and Spring Boot 3.2.0. The expected resolved JUnit Jupiter version is 5.10.1, managed by Spring Boot's dependency management; have Copilot verify the resolved dependency rather than infer it from the starter name alone.

4. Use **Copilot Fusion or Auto Model** to measure and review backend coverage. Prompt:

   > What is the current test coverage of my backend? Install jacoco to measure coverage if needed.

   Then prompt:

   > Review existing application tests, provide existing test coverage (add coverage tool jacoco to measure test coverage).

   Ask Copilot to show the report location and distinguish line coverage from branch coverage. Review the existing tests and coverage report before planning additional tests.

5. In **Plan mode**, identify service-layer tests to add. Prompt:

   > Identify unit tests to increase test coverage on the service layer.

   Review the proposed test cases. Keep the scope on service-layer unit tests and confirm that the plan covers meaningful behavior and edge cases, not just line execution. If the measured baseline already exceeds 80%, ask Copilot to target uncovered behavior or raise the threshold; avoid adding tests that only inflate coverage.

6. Switch to **Agent mode** and implement the reviewed plan. Prompt:

   > Using this plan, implement unit tests for the service layer, iterate until all tests pass and line coverage for the service package reaches at least 80%.

   Review the changed tests, then inspect test and coverage output. Ask Copilot to address failures or uncovered service behavior and rerun the tests.

7. After implementation, if coverage has not already been displayed, prompt:

   > Show current test coverage.


## 5. End-to-End Testing with Playwright MCP

**Demo goal:** Use Playwright MCP to explore the sample application, identify missing end-to-end coverage, implement selected tests, and iterate based on browser results.

### Install Playwright Skills

Prompt:

> Install the playwright-generate-test and playwright-explore-website skills from awesome-copilot: https://github.com/github/awesome-copilot/tree/main/skills/


### Review Existing E2E Coverage

Prompt:

> Review existing playwright tests and identify missing end to end tests.

Ask Copilot to inspect the existing specs and prioritize gaps by user impact. Discuss which candidates are worth testing end to end and which are better suited to unit or integration tests.

### Implement and Iterate

Choose one or two of the identified test cases if time is limited. Prompt:

> Implement the identified playwright end-to-end tests, iterate until all end-to-end tests pass.

To run end-to-end tests manually, from the `tests` directory:

```bash
npx playwright test --project=chromium
```

The Playwright configuration uses the local frontend at `http://localhost:5173` and backend health endpoint at `http://localhost:8080/actuator/health`. It also defines WebKit, tablet, and mobile projects for broader cross-browser and responsive coverage.

## Close

Recap the progression: a human-reviewed test plan becomes executable tests; reusable skills and custom agents preserve QA conventions; and browser-driven results provide the feedback for the next iteration. Emphasize that the tester remains responsible for reviewing test intent, assertions, coverage claims, and regressions.
