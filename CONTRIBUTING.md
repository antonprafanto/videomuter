# Contributing to Video Muter

First off, thank you for considering contributing to Video Muter! 🎉

It's people like you that make Video Muter such a great tool for everyone.

## Code of Conduct

This project and everyone participating in it is governed by respect and professionalism. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots** if applicable
- **Include your environment details** (OS, Electron version, etc.)

### Suggesting Features

Feature suggestions are tracked as GitHub issues. When creating a feature suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested feature**
- **Explain why this feature would be useful** to most Video Muter users
- **List some examples** of how the feature would be used

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes** following the code style below
3. **Test your changes** thoroughly
4. **Update the README.md** if needed
5. **Ensure your code follows** the existing code style
6. **Write clear commit messages**
7. **Submit your pull request!**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/videomuter.git

# Navigate to the directory
cd videomuter

# Install dependencies
npm install

# Run the app in development mode
npm start
```

## Code Style

- Use 2 spaces for indentation
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Follow the existing code style in the project

## Project Structure

```
mute/
├── main.js              # Electron main process
├── preload.js          # IPC bridge
├── renderer/           # Frontend code
│   ├── index.html
│   ├── styles.css
│   └── renderer.js
├── utils/              # Utility modules
└── tasks/              # Development notes
```

## Testing

Before submitting a PR:

1. Test the app in development mode (`npm start`)
2. Build the app (`npm run build`) and test the executable
3. Test with various video formats
4. Check for console errors
5. Verify all features work as expected

## Commit Message Guidelines

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests when relevant

Examples:
```
✅ Good:
- Add pause/resume functionality
- Fix memory leak in video processing
- Update README with new features

❌ Bad:
- Added stuff
- Fixed bugs
- Updated things
```

## Additional Notes

### Issue and Pull Request Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

## Questions?

Feel free to:
- Open an issue for discussion
- Contact via [GitHub Discussions](https://github.com/antonprafanto/videomuter/discussions)
- Reach out via [Trakteer](https://trakteer.id/limitless7/tip)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for making Video Muter better!** ❤️
