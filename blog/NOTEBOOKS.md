# VS Code notebook publishing

이 블로그는 VS Code에서 작성하고 실행한 Jupyter notebook을 코드, 저장된
실행 결과, 이미지와 함께 Jekyll 글로 변환할 수 있습니다.

## 처음 한 번만 준비하기

VS Code에서 Command Palette를 열고 `Tasks: Run Task` →
`Blog: Set Up Notebook Tools`를 실행합니다. 블로그 전용 `.venv`가 만들어지고
필요한 변환 도구가 설치됩니다.

VS Code에는 Jupyter 확장도 설치되어 있어야 합니다.

## 글 작성하기

1. `blog/notebooks/template.ipynb`를 복사합니다.
2. 파일명을 `YYYY-MM-DD-short-title.ipynb` 형식으로 바꿉니다.
3. 첫 번째 Markdown 셀에서 제목, 설명, 언어와 폴더를 수정합니다.
4. 나머지 셀에 설명과 코드를 작성합니다.
5. 코드를 실행한 뒤 결과가 보이는 상태로 notebook을 저장합니다.

첫 번째 셀의 예시:

```yaml
---
title: 나의 노트북 글
description: 블로그 목록에 표시할 한 문장
lang: ko
categories:
  - Python
---

글의 도입부를 여기에 작성합니다.
```

폴더는 `Cosmology`, `Machine Learning`, `Generative Model`, `Python` 중
하나를 사용합니다.

## 블로그 글로 변환하기

1. VS Code에서 Command Palette를 엽니다.
2. `Tasks: Run Task`를 선택합니다.
3. `Blog: Publish Notebook`을 선택합니다.
4. notebook 경로를 입력합니다.

그러면 다음 두 곳에 결과가 만들어집니다.

- `blog/_posts/` — Jekyll이 읽는 Markdown 글
- `blog/assets/notebooks/` — notebook에서 생성된 그림과 첨부 파일

생성된 Markdown은 직접 수정하지 않습니다. 원본 notebook을 수정한 뒤 같은
작업을 다시 실행하면 글이 갱신됩니다. 변환 과정은 코드를 다시 실행하지 않고
notebook에 저장된 마지막 실행 결과를 사용합니다.
