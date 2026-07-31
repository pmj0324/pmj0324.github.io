# Personal Blog 사용법

이 블로그는 **Jekyll**과 **GitHub Pages**로 작동합니다.
`blog/_posts/` 폴더에 Markdown 파일을 만들고 GitHub에 push하면 새 글이
자동으로 게시됩니다.

## 블로그 구조

```text
blog/
├── _posts/              # 블로그 글을 저장하는 폴더
├── _layouts/            # 글과 목록의 HTML 레이아웃
├── assets/css/          # 블로그 디자인
├── ko/                  # 한국어 목록과 폴더 페이지
└── index.html           # 영어 글 목록
```

새 글을 작성할 때는 `blog/_posts/`만 사용하면 됩니다. `index.html`이나
레이아웃 파일은 수정하지 않아도 됩니다.

## 1. 새 글 파일 만들기

기존 파일인 `blog/_posts/2026-08-01-starting-the-notebook.md`를 복사하거나
새 Markdown 파일을 만듭니다.

파일 이름은 다음 형식을 사용합니다.

```text
YYYY-MM-DD-short-title.md
```

예시:

```text
2026-08-02-first-cosmology-note.md
```

날짜 뒤의 제목은 영어 소문자, 숫자와 하이픈(`-`)을 사용하는 것이 안전합니다.
이 파일 이름을 바탕으로 글의 주소가 만들어집니다.

```text
https://pmj0324.github.io/blog/2026/08/02/first-cosmology-note/
```

## 2. 한국어 글 작성하기

파일 맨 위에는 아래와 같은 글 정보가 필요합니다.

```markdown
---
title: 첫 번째 우주론 노트
description: 이 글을 한 문장으로 설명합니다.
lang: ko
categories:
  - Cosmology
---

여기부터 실제 글을 작성합니다.

## 첫 번째 소제목

본문을 자유롭게 작성하면 됩니다.
```

`lang: ko`로 작성한 글은 한국어 목록에 표시됩니다.

```text
https://pmj0324.github.io/blog/ko/
```

## 3. 영어 글 작성하기

영어 글은 `lang`을 `en`으로 설정합니다.

```markdown
---
title: My first cosmology note
description: A short description of this post.
lang: en
categories:
  - Cosmology
---

Write the article here.
```

`lang: en`으로 작성한 글은 기본 영어 목록에 표시됩니다.

```text
https://pmj0324.github.io/blog/
```

## 4. 폴더 선택하기

현재 사용할 수 있는 폴더 이름은 다음과 같습니다.

- `Cosmology`
- `Machine Learning`
- `Generative Model`
- `Python`

예를 들어 Python 폴더에 넣으려면 다음과 같이 작성합니다.

```yaml
categories:
  - Python
```

어떤 폴더에도 넣지 않으려면 `categories` 부분을 생략해도 됩니다.

## Personal 페이지

영어 페이지는 `blog/personal/index.html`, 한국어 페이지는
`blog/ko/personal/index.html`에서 수정합니다. 접힌 카드를 누르면 가려진
내용이 펼쳐지는 형태입니다.

이 기능은 디자인 효과이며 비밀번호 보호 기능이 아닙니다. GitHub Pages에 올린
내용과 소스 코드는 모두 공개되므로 실제 비밀번호, 개인정보나 비공개 기록을
넣으면 안 됩니다.

## 5. Markdown 문법

````markdown
# 가장 큰 제목
## 소제목
### 더 작은 제목

**굵은 글씨**
*기울임 글씨*

- 첫 번째 항목
- 두 번째 항목

[링크 이름](https://example.com)

`짧은 코드`

```python
print("Hello, world!")
```
````

이미지는 `blog/assets/images/` 안에 저장한 뒤 다음처럼 사용할 수 있습니다.

```markdown
![이미지 설명](/blog/assets/images/example.png)
```

## 6. GitHub에 게시하기

VS Code에서 `Terminal` → `New Terminal`을 열고 저장소의 최상위 폴더에서
다음 명령을 실행합니다.

```bash
git status
git add blog/_posts/2026-08-02-first-cosmology-note.md
git commit -m "Add first cosmology note"
git push origin main
```

`git add` 뒤의 경로는 실제로 작성한 파일 이름으로 바꿉니다.

push가 끝나면 GitHub Pages가 블로그를 자동으로 다시 만듭니다. 보통 몇 분 뒤
블로그 페이지를 새로고침하면 새 글이 나타납니다.

## 전체 과정 요약

```text
blog/_posts에 Markdown 파일 만들기
→ 글 정보와 본문 작성하기
→ 파일 저장하기
→ git add
→ git commit
→ git push
→ GitHub Pages에서 자동 게시
```

## 로컬에서 미리 보기

Ruby와 Jekyll이 설치되어 있다면 저장소의 최상위 폴더에서 실행합니다.

```bash
bundle install
bundle exec jekyll serve
```

그다음 브라우저에서 아래 주소를 엽니다.

```text
http://127.0.0.1:4000/blog/
```

미리 보기를 종료하려면 터미널에서 `Ctrl+C`를 누릅니다.

현재 macOS 기본 Ruby는 이 프로젝트의 Jekyll 버전보다 오래되었을 수 있습니다.
로컬 미리 보기가 되지 않더라도 GitHub에 push한 뒤 자동 배포하는 방식은 사용할
수 있습니다.
