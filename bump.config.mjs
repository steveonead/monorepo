import { execSync } from 'node:child_process';

export default {
  commit: 'chore: release v%s',
  tag: 'v%s',
  push: false,
  execute({ state }) {
    execSync(`pnpm exec changelogen -r ${state.newVersion} --output CHANGELOG.md`, {
      stdio: 'inherit',
    });
  },
};
