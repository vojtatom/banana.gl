# Metacity Workspace

Metacity Workspace is a Python package, which is also the main Metacity application. For easy installation, follow the instructions described [here](https://github.com/MetacitySuite/Metacity-Guide).

See running live:

http://metacity.cc

## Branches
| Branch | Description |
| ------ | ----------- |
| main   | protected, merged PRs auto tested and deployed to PyPI and to live server if tag present |
| dev    | merged PRs auto tested and version bumped if tag present |


## PR Merge Commit message conventions
Use any of the following tags in the merge commit message title to indicate the type of PR:

| In commit message | Descrition | Branches |
| ---------------------- | ----------- | ------- |
| `action::bump` | flag to run bump pipeline | dev |
| `action::package` | flag to run deploy package to PyPI | main |
| `action::deploy` | flag to run deploy to metacity.cc server | main |

Dev branch actions (together with `action::bump`):

| In commit message | Descrition | Branches |
| ---------------------- | ----------- | ------- |
| `version::patch` | bump version after patch/bug fix/minor change | dev |
| `version::minor` | bump version after new feature/minor change | dev |
| `version::major` | bump version after major change/breaking change | dev |

If no tag is used, no action runs after the PR is merged. If no version tag is used, the version is bumped as patch.