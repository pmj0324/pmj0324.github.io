---
title: "Conda, Miniconda, Micromamba: 스치기"
description: 10분만에 끝내는 Conda 기본 개념 이해와 설치
lang: ko
categories:
  - Python
---

대부분의 Python 책이나 강의를 펼치면 가장 먼저 마주치는 것이 `Conda` 또는
`Miniconda` 설치다. 가끔은 `Micromamba`라는 낯선 이름까지 등장한다. 그런데
Python도 아직 잘 모르겠는데 라이브러리니 가상환경이니 의존성이니 하는 말들이
한꺼번에 튀어나온다. 설치 한 번 해보려다가 시작도 전에 책을 덮고 싶어진다.
적어도 필자는 그랬다.

그래서 이 글에서는 복잡한 이야기는 잠시 미뤄 두고, 세 도구를 사용하기 위해 꼭
필요한 개념만 짚어 보려고 한다. 그다음 직접 설치하고 첫 환경을 만들어 보자.

## Introduction

환경 관리를 설명하기 전에 몇 가지 용어만 간단히 정리하고 가자. 프로그래밍 언어,
라이브러리, 버전, 의존성 같은 개념은 각각 별도의 글이 필요할 만큼 큰 주제다. 이
글에서는 환경 관리가 왜 필요한지 이해할 수 있을 정도로만 살펴보고, 자세한 내용은
이후 글에서 따로 다루려고 한다.

### 프로그래밍 언어

우리가 컴퓨터로 어떤 프로그램을 만들려면 컴퓨터에게 무엇을 해야 하는지 알려줄
방법이 필요하다. 이때 사용하는 것이 **프로그래밍 언어**다. Python, C, C++ 등이
여기에 해당한다.

하지만 Python으로 프로그램을 만든다고 해서 Python 하나만 설치하면 모든 것이
끝나는 것은 아니다. 실제 프로그램은 대부분 다른 사람이 미리 만들어 둔 여러
기능을 가져와 함께 사용한다.

### 라이브러리

다른 사람이 미리 만들어 둔 기능을 모아 놓은 것을 **라이브러리**라고 한다. 예를
들어 Python에서 수치 계산을 할 때 사용하는 NumPy, 그래프를 그릴 때 사용하는
Matplotlib 등이 라이브러리다.

매번 계산이나 그래프 기능을 처음부터 직접 만들 필요 없이, 필요한 라이브러리를
설치하고 가져와 사용할 수 있다. 우리가 작성할 코드는 짧아지지만, 대신 그
라이브러리가 있어야 프로그램도 정상적으로 실행된다.

### 버전과 의존성

프로그래밍 언어와 라이브러리는 한 번 만들어지고 끝나는 것이 아니라 계속
수정된다. 기능이 추가되거나 오류가 고쳐질 때마다 `Python 3.10`, `Python 3.12`,
`NumPy 1.26`처럼 서로 다른 **버전**이 만들어진다.

처음에는 그냥 전부 최신 버전으로 설치하면 되는 것 아닌가 싶다. 필자도 그렇게
생각했다. 하지만 프로그램들은 생각보다 최신 버전을 좋아하지 않는다. 어떤 코드는
오래된 라이브러리에서만 작동하고, 어떤 라이브러리는 특정 Python 버전에서만
설치된다.

이처럼 프로그램이 실행되기 위해 필요한 언어, 라이브러리, 도구 등을
**의존성(dependency)**이라고 한다. 쉽게 말하면 “이 프로그램이 실행되려면 같이
있어야 하는 것들”이다.

예를 들어 어떤 프로젝트에는 Python 3.10과 NumPy 1.26이 필요하지만, 다른
프로젝트에는 Python 3.12와 최신 NumPy가 필요할 수 있다. 이들을 모두 한곳에
설치하면 서로 필요한 버전이 달라 충돌한다. 어제까지 잘 실행되던 프로그램이
라이브러리 하나를 업데이트한 뒤 갑자기 실행되지 않는 일도 생긴다.

## 그래서 환경 관리가 필요하다

그래서 프로젝트마다 필요한 프로그래밍 언어와 라이브러리를 따로 모아 둔다. 이렇게
분리된 작업 공간을 **환경(environment)**이라고 하고, 환경을 만들고 그 안의
프로그램과 버전을 관리하는 것을 **환경 관리**라고 한다. Python에서는 이렇게
분리된 환경을 흔히 **가상환경**이라고도 부른다.

문제는 프로젝트를 시작할 때마다 필요한 Python 버전을 찾고, 라이브러리를 하나씩
설치하고, 서로 호환되는 버전까지 직접 맞추는 일이 꽤 귀찮다는 것이다. 그래서 이런
것들을 대신 관리해 주는 도구가 만들어졌다.

## 그래서 Conda가 뭔데?

그중 하나가 **Conda**다. 그런데 Conda를 검색하면 곧바로 Miniconda가 나오고,
조금 더 찾아보면 Micromamba까지 등장한다. 이름부터 꽤 헷갈린다. 우선 결론부터
말하면 셋은 같은 프로그램의 다른 이름이 아니다. 하는 일은 비슷하지만 각각의
역할과 설치 방식이 조금씩 다르다.

### Conda

Conda는 프로젝트별 환경을 만들고, 그 안에 필요한 Python과 라이브러리를 설치하는
**환경·패키지 관리자**다. 예를 들어 `study`라는 환경을 만들면서 Python 3.12와
NumPy를 설치해 달라고 하면, Conda가 서로 호환되는 패키지와 의존성을 찾아 함께
설치해 준다.

즉, 환경을 나누는 일과 필요한 라이브러리를 설치하는 일을 하나의 도구로 처리할 수
있다. 사용자는 터미널에서 `conda`라는 명령으로 이 기능을 사용한다.

### Miniconda

여기서 가장 헷갈리기 쉬운 부분이다. **Miniconda는 Conda와 경쟁하는 다른 도구가
아니다.** Conda와 Python, 그리고 실행에 필요한 최소한의 패키지를 묶어 둔 가벼운
설치판이다. 따라서 Miniconda를 설치하면 컴퓨터에서 `conda` 명령을 사용할 수 있게
된다.

Anaconda처럼 많은 라이브러리를 처음부터 한꺼번에 설치하지 않고, 필요한 것만
나중에 직접 추가할 수 있어 시작하기에 부담이 적다. 공식 비교는
[Anaconda와 Miniconda 선택 안내](https://www.anaconda.com/docs/getting-started/concepts/anaconda-or-miniconda)에
정리되어 있다.

### Micromamba

Micromamba는 Conda와 비슷한 방식으로 환경과 패키지를 관리하는 **별도의 도구**다.
Conda의 패키지와 환경 형식을 사용하지만, 자체 Python이나 미리 채워진 `base`
환경이 없는 작은 실행 파일로 제공된다. 그래서 설치가 가볍고 서버나 컨테이너에서도
쓰기 좋다.

명령어도 Conda와 매우 비슷하지만 모든 기능이 완전히 같은 것은 아니다.
[Micromamba 사용자 안내](https://mamba.readthedocs.io/en/stable/user_guide/micromamba.html)에서도
Conda 명령의 일부를 지원하는 별도 CLI라고 설명한다.

> 처음 환경 관리를 배우는 중이라면 Miniconda를 설치해 Conda를 사용하는 것이
> 무난하다. 터미널 사용에 익숙하고 더 작은 설치를 원한다면 Micromamba를 선택해도
> 된다. 처음부터 둘 다 설치할 필요는 없다.

## 설치 전에 확인하기

이미 설치되어 있는지 터미널에서 먼저 확인한다.

```bash
conda --version
micromamba --version
```

둘 중 하나가 버전 번호를 출력한다면 해당 도구가 이미 설치된 것이다. 명령을
찾을 수 없다는 메시지가 나온다면 아래 설치 과정으로 넘어간다.

CPU 종류도 확인해 두는 것이 좋다.

```bash
uname -m
```

`uname`은 현재 시스템의 정보를 보여 주는 명령이고, `-m`은 그중 컴퓨터의 CPU
구조(machine hardware name)만 보여 달라는 옵션이다.

- `arm64` 또는 `aarch64`: ARM 계열
- `x86_64`: Intel/AMD 64비트 계열

설치 파일 이름의 `arm64`, `aarch64`, `x86_64`가 자신의 컴퓨터와 맞아야 한다.

## 방법 A: Miniconda 설치하기

### macOS

Apple Silicon(M1, M2, M3, M4 등)을 사용하는 Mac이라면 그래픽 설치가 가장
간단하다.

1. [Miniconda 다운로드 페이지](https://www.anaconda.com/download/success)에서
   macOS Apple Silicon용 `.pkg` 파일을 내려받는다.
2. 내려받은 파일을 열어 설치를 진행한다.
3. 설치가 끝나면 터미널을 완전히 닫았다가 다시 연다.
4. 설치를 확인한다.

```bash
conda --version
conda info
```

터미널 설치를 선호한다면 Apple Silicon에서는 다음 파일을 사용할 수 있다.

```bash
curl -O https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-arm64.sh
bash Miniconda3-latest-MacOSX-arm64.sh
```

처음 보면 한 줄에 이상한 기호가 많아 보이지만, 두 명령이 하는 일은 단순하다.

- `curl`은 인터넷 주소에서 파일이나 데이터를 받아 오는 프로그램이다.
- `-O`는 숫자 0이 아니라 **대문자 O**다. 주소 끝에 있는 파일 이름을 그대로
  사용해 현재 폴더에 저장하라는 뜻이다.
- 뒤의 주소는 내려받을 Miniconda 설치 파일의 위치다.
- `bash 파일이름`은 내려받은 설치 스크립트를 Bash로 실행한다는 뜻이다.

즉, 첫 줄은 설치 파일을 내려받고 두 번째 줄은 그 파일을 실행한다. 인터넷에서
받은 스크립트를 실행할 때는 주소가 공식 사이트인지 한 번 확인하는 습관을 들이는
것이 좋다. 이 글에서는 Anaconda의 공식 저장소인 `repo.anaconda.com`을 사용한다.

설치 도중 라이선스에 동의하고, `conda init`을 실행할지 묻는 질문에는 `yes`를
선택한다. 설치 후 새 터미널을 열거나 다음 명령을 실행한다.

```bash
source ~/.zshrc
```

`conda init`은 터미널을 열 때 Conda를 사용할 수 있도록 `~/.zshrc`에 설정을
추가한다. `source`는 터미널을 새로 열지 않고 그 설정 파일을 지금 바로 다시 읽는
명령이다. 여기서 `~`는 현재 사용자의 홈 폴더를 뜻한다.

2025년 8월 이후 Anaconda는 Intel Mac용 최신 Miniconda 빌드를 중단했다. Intel
Mac에서는 공식 보관소의 마지막 지원 설치판을 확인해야 한다. 최신 안내는
[macOS 공식 설치 문서](https://www.anaconda.com/docs/getting-started/miniconda/install/mac-gui-install)를
참고한다.

### Linux

일반적인 Intel/AMD 64비트 Linux에서는 다음과 같이 설치한다.

```bash
curl -O https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh
```

macOS에서 본 명령과 구조는 같다. `curl -O`로 설치 파일을 현재 폴더에 저장하고,
`bash`로 그 파일을 실행한다. 달라지는 것은 운영체제와 CPU에 맞춘 파일 이름뿐이다.

ARM64 서버에서는 파일 이름을 바꾼다.

```bash
curl -O https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-aarch64.sh
bash Miniconda3-latest-Linux-aarch64.sh
```

설치 위치는 특별한 이유가 없다면 기본값을 사용하고, 마지막의 `conda init`
질문에는 `yes`를 선택한다. 이후 터미널을 다시 열거나 Bash라면 다음 명령으로
설정을 불러온다.

```bash
source ~/.bashrc
conda --version
```

설치 파일을 실행하기 전에 SHA-256 값을 공식 보관소의 값과 비교하면 파일이
손상되거나 변조되지 않았는지 확인할 수 있다. 전체 과정은
[Linux 공식 설치 안내](https://www.anaconda.com/docs/getting-started/miniconda/install/linux-install)에
나와 있다.

## 방법 B: Micromamba 설치하기

Miniconda를 선택했다면 이 부분은 건너뛰어도 된다.

### macOS와 Linux

Micromamba 공식 문서에서 권장하는 자동 설치 명령은 다음과 같다.

```bash
"${SHELL}" <(curl -L micro.mamba.pm/install.sh)
```

이 명령은 조금 더 낯설게 생겼다. 하나씩 보면 다음과 같다.

- `${SHELL}`은 지금 사용하고 있는 shell의 경로다. macOS라면 보통 `/bin/zsh`,
  Linux라면 `/bin/bash`가 나온다.
- `curl -L`은 설치 스크립트를 받아 온다. `-L`은 주소가 다른 곳으로 연결될 때 그
  이동을 따라가라는 옵션이다.
- `<(...)`는 괄호 안에서 받은 내용을 임시 입력처럼 만들어 현재 shell에 넘긴다.

결국 공식 주소에서 설치 스크립트를 받아 현재 사용 중인 shell로 바로 실행하는
명령이다. 질문에 따라 설치 위치와 shell 초기화를 정한 뒤 터미널을 다시 열고
설치를 확인한다.

```bash
micromamba --version
micromamba info
```

Homebrew를 사용하는 macOS에서는 다음 한 줄로도 설치할 수 있다.

```bash
brew install micromamba
```

`brew`는 macOS용 패키지 관리자인 Homebrew 명령이고, `install` 뒤에 적은
`micromamba`를 찾아 설치하라는 뜻이다.

설치 후 zsh에서 환경 활성화가 되지 않는다면 shell을 초기화한다.

```bash
micromamba shell init -s zsh -r ~/micromamba
source ~/.zshrc
```

여기서 `shell init`은 Micromamba를 현재 shell에서 사용할 수 있도록 초기 설정을
추가한다. `-s zsh`는 사용하는 shell이 zsh라는 뜻이고, `-r ~/micromamba`는 환경과
패키지를 보관할 기본 위치를 지정한다. Bash를 사용한다면 `zsh`를 `bash`로 바꾸면
된다.

자동 설치와 수동 설치 방법은 [Micromamba 공식 설치 문서](https://mamba.readthedocs.io/en/stable/installation/micromamba-installation.html)에서
확인할 수 있다.

## 채널 설정하기

Conda가 패키지를 설치하려면 먼저 어디에서 패키지를 받아 올지 알아야 한다. 이때
패키지를 모아 둔 저장소를 **채널(channel)**이라고 한다. 스마트폰에서 앱을 받을
때 앱스토어가 필요한 것과 비슷하다.

이 글에서는 다양한 Python 및 과학 계산 패키지를 제공하는 `conda-forge`를
사용한다. 채널마다 같은 이름의 패키지를 서로 다른 방식으로 만들 수 있기 때문에,
여러 채널을 아무렇게나 섞으면 다시 호환성 문제가 생길 수 있다. 그래서 사용할
채널과 우선순위를 먼저 정해 둔다.

Miniconda를 설치했다면:

```bash
conda config --add channels conda-forge
conda config --set channel_priority strict
```

- `config`는 Conda의 설정을 바꾼다는 뜻이다.
- `--add channels conda-forge`는 패키지를 찾을 채널에 `conda-forge`를 추가한다.
- `--set channel_priority strict`는 우선순위가 높은 채널에서 패키지를 찾았다면
  아래 채널의 같은 이름 패키지를 섞지 않도록 한다.

Micromamba를 설치했다면:

```bash
micromamba config append channels conda-forge
micromamba config set channel_priority strict
```

명령 앞부분만 `conda`에서 `micromamba`로 달라질 뿐, 설정하려는 내용은 같다.

## 첫 환경 만들기

이제 설명만 하던 환경을 직접 만들어 보자. 이름은 `study`로 하고, 그 안에 Python
3.12와 NumPy, Matplotlib을 설치한다.

Miniconda를 선택한 경우:

```bash
conda create -n study python=3.12 numpy matplotlib -y
conda activate study
```

Micromamba를 선택한 경우:

```bash
micromamba create -n study python=3.12 numpy matplotlib -y
micromamba activate study
```

긴 명령처럼 보이지만 왼쪽부터 읽으면 어렵지 않다.

- `create`는 새로운 환경을 만든다.
- `-n study`에서 `-n`은 환경의 이름(name)을 정하는 옵션이다. 여기서는 이름을
  `study`로 정했다.
- `python=3.12`는 Python을 설치하되 3.12 버전을 사용하겠다는 뜻이다.
- 뒤의 `numpy matplotlib`은 함께 설치할 라이브러리 이름이다.
- `-y`는 설치 여부를 물어볼 때 자동으로 yes라고 답한다. 설치될 목록을 직접
  확인하고 싶다면 `-y`를 빼도 된다.
- `activate study`는 방금 만든 환경으로 들어간다는 뜻이다.

터미널 앞에 `(study)`가 표시되면 환경이 활성화된 것이다. Python과 NumPy가
제대로 설치되었는지 확인한다.

```bash
python --version
python -c "import numpy; print(numpy.__version__)"
```

첫 줄은 현재 활성화된 환경의 Python 버전을 보여 준다. 두 번째 줄의 `python -c`는
따옴표 안의 Python 코드를 파일 없이 바로 실행한다. `import numpy`로 NumPy를
불러오고, `numpy.__version__`으로 설치된 버전을 출력한다.

간단한 계산도 실행해 볼 수 있다.

```bash
python -c "import numpy as np; print(np.arange(5) ** 2)"
```

여기서는 NumPy를 `np`라는 짧은 이름으로 불러온다. `np.arange(5)`는 0부터 4까지의
숫자를 만들고, `** 2`는 각각을 제곱한다. 환경 안의 Python과 NumPy가 모두 제대로
동작하는지 확인하기 위한 아주 짧은 테스트다.

다음과 같은 결과가 나오면 정상이다.

```text
[ 0  1  4  9 16]
```

## Conda 환경에서 pip를 써도 될까?

쓸 수 있다. 다만 Conda와 pip는 패키지를 관리하는 방식이 달라 아무 순서로나 섞어
쓰면 서로가 설치한 내용을 정확히 알지 못할 수 있다. 그러면 다시 의존성 문제가
생긴다. 환경까지 만들었는데 처음의 문제로 돌아가고 싶은 사람은 없을 것이다.

가능한 패키지는 먼저 Conda로 설치하고, Conda 채널에서 찾을 수 없는 패키지만
마지막에 pip로 설치하는 편이 안전하다.

```bash
conda activate study
conda install pip
python -m pip install package-name
```

- `conda activate study`로 패키지를 설치할 환경에 먼저 들어간다.
- `conda install pip`는 그 환경 안에 pip를 설치한다.
- `python -m pip`는 현재 환경의 Python으로 pip를 실행한다. 그냥 `pip`라고 쓰는
  것보다 어느 Python의 pip를 사용하는지 분명해진다.
- `package-name` 자리에는 실제로 설치하려는 패키지 이름을 넣는다.

공식 문서도 Conda와 pip를 섞을 때 격리된 환경을 사용하고 Conda 설치를 먼저
끝낼 것을 권장한다. pip를 사용한 뒤 Conda 패키지를 계속 추가하다가 충돌이
생겼다면, 복잡하게 고치기보다 새 환경을 만드는 편이 오히려 빠를 때도 많다. 자세한
내용은
[Conda 환경 관리 문서](https://docs.conda.io/projects/conda/en/stable/user-guide/tasks/manage-environments.html)에서
확인할 수 있다.

## 자주 막히는 지점

### `conda: command not found`

설치는 끝났는데 이 문장이 나오면 당황하기 쉽다. 보통 Conda가 없는 것이 아니라,
현재 터미널이 Conda의 위치를 아직 모르는 상태다. 우선 터미널을 완전히 닫았다가
다시 연다. 그래도 안 된다면 Miniconda가 설치된 경로에서 shell 초기화를 다시
실행한다.

```bash
~/miniconda3/bin/conda init
```

macOS의 그래픽 설치 위치가 `/opt/miniconda3`라면 다음 경로일 수 있다.

```bash
/opt/miniconda3/bin/conda init
```

앞부분은 설치된 Conda 실행 파일의 경로이고, `init`은 현재 shell의 설정 파일에
Conda를 사용할 수 있는 내용을 추가한다. 실행한 뒤에는 터미널을 다시 열어야 한다.

### `micromamba activate`가 동작하지 않음

Micromamba 파일은 설치되었지만 환경을 바꾸기 위한 shell 설정이 아직 적용되지 않은
경우가 많다. 사용 중인 shell에 맞게 초기화한 뒤 설정을 다시 불러온다.

```bash
micromamba shell init -s zsh -r ~/micromamba
source ~/.zshrc
```

Bash 사용자는 `zsh`와 `.zshrc`를 각각 `bash`와 `.bashrc`로 바꾼다.

### 터미널을 열 때마다 `(base)`가 표시됨

Miniconda를 설치한 뒤 터미널 앞에 갑자기 `(base)`가 붙어도 오류는 아니다. Conda가
기본 환경인 base를 자동으로 활성화한 것이다. 계속 보여서 거슬린다면 자동 활성화를
끌 수 있다.

```bash
conda config --set auto_activate_base false
```

`auto_activate_base`라는 설정을 `false`로 바꾸는 명령이다. 이후에는 필요한 순간에만
`conda activate study`처럼 원하는 환경으로 들어가면 된다.

### 모든 패키지를 base에 설치해도 될까?

설치는 된다. 하지만 그러다 보면 base가 다시 모든 패키지가 뒤섞인 공간이 된다.
base는 Conda 자체를 관리하는 곳으로 가볍게 남겨 두고, 프로젝트마다 `study`,
`cosmology`, `ml-project`처럼 별도 환경을 만드는 습관이 좋다. 조금 귀찮아 보여도
나중에 문제가 생겼을 때 환경 하나만 지우고 다시 만들 수 있어 훨씬 편하다.

## 그래서 무엇을 선택해야 할까

처음이라면 **Miniconda**가 무난하다. 검색했을 때 나오는 자료가 많고, 대부분의
Python 책과 강의에서 사용하는 `conda` 명령을 그대로 따라갈 수 있다.

이미 터미널 사용이 익숙하거나, 설치 크기를 줄이고 싶거나, 원격 서버와 컨테이너를
자주 사용한다면 **Micromamba**가 잘 맞는다. 그렇다고 처음부터 둘 다 설치해 비교할
필요는 없다. 하나를 골라 환경을 만들고 사용하는 흐름부터 익히면 된다.

무엇을 선택하든 가장 중요한 원칙은 같다. **프로젝트마다 환경을 하나씩 만들고,
base 환경에는 가능한 한 손대지 않으며, 환경을 다시 만들 수 있도록 필요한
패키지를 기록해 두는 것**이다. 도구 이름보다 이 습관을 익히는 것이 더 중요하다.

## 참고 문서

- [Conda 공식 사용자 안내](https://docs.conda.io/projects/conda/en/stable/user-guide/)
- [Miniconda 시스템 요구 사항](https://www.anaconda.com/docs/getting-started/miniconda/system-requirements)
- [Miniconda 설치 안내](https://www.anaconda.com/docs/getting-started/miniconda/install)
- [Micromamba 설치](https://mamba.readthedocs.io/en/stable/installation/micromamba-installation.html)
- [Micromamba 사용자 안내](https://mamba.readthedocs.io/en/stable/user_guide/micromamba.html)
