# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Nothing yet!

## [0.1.16] - 2025-12-29

### Fixed

- Fix multi-line className indentation: now correctly preserves original string indentation format
- Optimize single-line/multi-line expansion logic: only expand to multi-line categorized format when class count >= 5

### Added

- Add complex-jsx test case covering complex nested JSX scenarios

## [0.1.14] - 2025-12-11

### Features

- support grouping tailwindcss classes
- support custom categories
- support dynamic wrapping
- support format fn string args in className 
- support format class in template string