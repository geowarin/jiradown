import { describe, expect, it } from "vitest";
import { convert } from "../convert";

describe("Integration Test", () => {
  it("should correctly convert a complex Jira issue", () => {
    const jiraIssue = `
h1. Project Alpha - Issue Tracker

h2. Description
This issue tracks the implementation of the *new authentication system*.
It's critical for our [Q1 roadmap|https://example.com/roadmap].

{panel:title=Important Note}
Please ensure that all tests pass before merging.
{panel}

h3. Requirements
* Implement OAuth2 flow
* Add unit tests for:
** Login
** Logout
** Token refresh
* Documentation update

h3. Technical Details
{code:javascript}
function authenticate(user) {
  return oauth.login(user);
}
{code}

|| Task || Priority || Status ||
| Backend | High | (/) Done |
| Frontend | Medium | (x) Pending |
| QA | Low | (!) To Do |

Cheers,
[~accountid:12345]
`;

    expect(convert(jiraIssue).trim()).toMatchInlineSnapshot(`
      "# Project Alpha - Issue Tracker

      ## Description

      This issue tracks the implementation of the **new authentication system**.

      It's critical for our [Q1 roadmap](https://example.com/roadmap).

      > **Important Note**
      > Please ensure that all tests pass before merging.

      ### Requirements

      - Implement OAuth2 flow
      - Add unit tests for:
        - Login
        - Logout
        - Token refresh
      - Documentation update

      ### Technical Details

      \`\`\`javascript
      function authenticate(user) {
        return oauth.login(user);
      }
      \`\`\`

      |Task|Priority|Status||
      |---|---|---|---|
      |Backend|High|(/) Done||
      |Frontend|Medium|(x) Pending||
      |QA|Low|(!) To Do|Cheers,<br>@12345|"
    `);
  });
});
