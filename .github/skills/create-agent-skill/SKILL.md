---
name: create-agent-skill
description: Create new GitHub Copilot agent skills following agentskills.io specification. Use this when you need to define a new reusable workflow or specialized capability for AI agents.
license: MIT
---

# Create Agent Skill

This skill helps you create new agent skills following the [agentskills.io](https://agentskills.io/) specification. Agent skills are reusable workflows that teach GitHub Copilot and other AI agents how to perform specialized tasks.

## When to Use This Skill

Use this skill when you need to:
- Define a new reusable workflow or automation
- Create domain-specific instructions for AI agents
- Package a complex task into a portable, shareable format
- Extend GitHub Copilot with project-specific capabilities

## Agent Skill Structure

Each agent skill should be in its own directory under `.github/skills/` with a `SKILL.md` file.

### Required Directory Structure
```
.github/skills/
└── skill-name/
    ├── SKILL.md          # Main skill definition (required)
    ├── examples/         # Optional: example usage
    ├── templates/        # Optional: code templates
    └── scripts/          # Optional: helper scripts
```

## SKILL.md Format

### YAML Frontmatter (Required)
```yaml
---
name: skill-name
description: Clear, concise description of what the skill does and when to use it
license: MIT  # Optional: license information
---
```

### Required Fields
- **name**: Unique, lowercase, hyphen-separated identifier
- **description**: Explains what the skill does and when it should trigger

### Markdown Body
After the frontmatter, include:
1. **Purpose**: What problem does this skill solve?
2. **When to Use**: Specific scenarios for triggering this skill
3. **Instructions**: Step-by-step workflow
4. **Examples**: Code snippets or usage examples
5. **Best Practices**: Tips for effective use
6. **Resources**: Links to related documentation

## Creating a New Skill: Step-by-Step

### 1. Create Skill Directory
```bash
mkdir -p .github/skills/my-skill-name
cd .github/skills/my-skill-name
```

### 2. Create SKILL.md File
```markdown
---
name: my-skill-name
description: Brief description of what this skill does
license: MIT
---

# My Skill Name

## Purpose
[Explain the problem this skill solves]

## When to Use
- Scenario 1
- Scenario 2
- Scenario 3

## Instructions
1. First step
2. Second step
3. Third step

## Example
\`\`\`language
// Example code
\`\`\`

## Best Practices
- Tip 1
- Tip 2

## Resources
- [Link to documentation]
```

### 3. Add Supporting Files (Optional)
```bash
# Create directories for examples, templates, or scripts
mkdir -p examples templates scripts

# Add example files
echo "Example content" > examples/example.txt

# Add templates
echo "Template content" > templates/template.txt

# Add helper scripts
echo "#!/bin/bash" > scripts/helper.sh
chmod +x scripts/helper.sh
```

### 4. Test the Skill
- Place the skill in `.github/skills/` directory
- Start a new GitHub Copilot chat session
- Test if Copilot recognizes and uses the skill when prompted

## Example Skills

### 1. Test Runner Skill
```markdown
---
name: test-runner-py
description: Run Python unit tests with pytest and summarize failures as structured output
license: MIT
---

# Python Test Runner

## Purpose
Automate running Python tests and provide actionable failure summaries.

## When to Use
- After making code changes to Python files
- Before committing code
- During code reviews

## Instructions
1. Run `pytest` in the project root with verbose output
2. Parse test results for failures and errors
3. For each failure, extract:
   - Test name and location
   - Failure message
   - Stack trace
4. Summarize results with clear action items

## Example
\`\`\`bash
pytest -v --tb=short
\`\`\`
```

### 2. API Endpoint Creator Skill
```markdown
---
name: api-endpoint-creator
description: Create RESTful API endpoints following project conventions
license: MIT
---

# API Endpoint Creator

## Purpose
Scaffold new REST API endpoints with consistent structure.

## When to Use
- Adding new API endpoints
- Creating CRUD operations
- Following REST conventions

## Instructions
1. Define endpoint path and HTTP method
2. Create controller method with proper annotations
3. Implement service layer logic
4. Add data validation
5. Write unit tests
6. Update API documentation

## Example
\`\`\`java
@GetMapping("/api/resource/{id}")
public ResponseEntity<ResourceDTO> getResource(@PathVariable Long id) {
    return ResponseEntity.ok(resourceService.getById(id));
}
\`\`\`
```

## Skill Naming Conventions

### Good Names
- `test-runner-py` - Clear, specific, includes language
- `api-endpoint-creator` - Describes action and domain
- `database-migration-helper` - Explains purpose and context

### Avoid
- `helper` - Too vague
- `utils` - Not descriptive
- `my-skill` - Not meaningful
- `TestSkill` - Use lowercase with hyphens

## Best Practices

### 1. Be Specific
- Clear, focused purpose
- Well-defined use cases
- Specific instructions

### 2. Include Examples
- Code snippets
- Command examples
- Expected outputs

### 3. Keep It Maintainable
- Update when workflows change
- Version your skills if needed
- Document dependencies

### 4. Make It Portable
- Avoid hard-coded paths
- Use relative references
- Document prerequisites

### 5. Test Thoroughly
- Verify skill triggers correctly
- Ensure instructions are clear
- Validate with different agents

## Skill Discovery

GitHub Copilot and compatible agents will automatically discover skills in:
- **Repository:** `.github/skills/`
- **User:** `~/.copilot/skills/`
- **Organization:** Organization's `.github` repository

Skills are loaded when:
- Copilot detects relevant context in the conversation
- The skill's description matches the task intent
- User explicitly requests the skill by name

## Integration with Other Tools

Skills can be used with:
- **GitHub Copilot in VS Code**: Automatically loaded
- **GitHub Copilot CLI**: Available in command context
- **GitHub Copilot Coding Agent**: Used for automated tasks
- **Other agentskills.io-compatible tools**: Portable across platforms

## Troubleshooting

### Skill Not Triggering
- Check `name` field is unique and lowercase
- Verify `description` clearly states when to use
- Ensure SKILL.md has proper YAML frontmatter
- Place skill in correct directory (`.github/skills/`)

### Instructions Not Followed
- Make instructions more specific and actionable
- Add examples for clarity
- Break down complex steps
- Include error handling guidance

### Poor Performance
- Simplify skill scope - focus on one task
- Reduce instruction verbosity
- Remove unnecessary context
- Test with minimal example

## Resources

### Official Documentation
- [Agent Skills Specification](https://agentskills.io/specification)
- [GitHub Copilot Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [VS Code Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)

### Community Resources
- [Microsoft Agent Skills Repository](https://github.com/microsoft/agent-skills)
- [Awesome Copilot Skills](https://github.com/github/awesome-copilot)

### Examples
- [Official Example Skills](https://github.com/microsoft/agent-skills/tree/main/skills)
- [Community Skills Library](https://agentskills.io/skills)

## Checklist for Creating New Skills

- [ ] Create skill directory under `.github/skills/`
- [ ] Write SKILL.md with proper YAML frontmatter
- [ ] Include clear name and description
- [ ] Document when to use the skill
- [ ] Provide step-by-step instructions
- [ ] Add code examples
- [ ] Include best practices
- [ ] Add supporting files if needed (templates, scripts)
- [ ] Test skill with GitHub Copilot
- [ ] Update repository documentation
- [ ] Share with team for feedback

## Contributing Skills

To contribute a new skill to this repository:
1. Follow this guide to create the skill
2. Test thoroughly with multiple scenarios
3. Document any prerequisites or dependencies
4. Submit a pull request with:
   - Skill directory and SKILL.md
   - Supporting files
   - Updated documentation
   - Example usage in PR description

---

**Version:** 1.0.0  
**Last Updated:** February 5, 2026  
**Maintained By:** Three Rivers Bank Development Team  
**Specification:** [agentskills.io](https://agentskills.io/)
