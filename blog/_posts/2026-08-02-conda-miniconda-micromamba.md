---
title: "Conda, Miniconda, Micromamba: 처음 시작하는 Python 환경 관리"
description: 이름이 비슷한 세 도구의 관계부터 운영체제별 설치, 첫 환경 생성과 Jupyter 실행까지 차근차근 정리합니다.
lang: ko
categories:
  - Python
---

Python을 처음 설치하려고 검색하면 `conda`, `Miniconda`, `micromamba`라는 이름이
한꺼번에 등장한다. 모두 비슷해 보이지만 사실 같은 종류의 이름은 아니다. 이
차이를 모르고 설치부터 시작하면 무엇을 설치했는지, 패키지는 어디에 들어갔는지,
왜 터미널 앞에 `(base)`가 붙는지부터 헷갈리기 쉽다.

이 글에서는 세 이름의 관계를 먼저 정리하고, Miniconda와 Micromamba 중 하나를
직접 설치해 첫 Python 환경을 만드는 데까지 진행한다. 처음부터 둘 다 설치할
필요는 없다.

## 먼저 알아둘 세 가지

### Conda

Conda는 **패키지 관리자이면서 환경 관리자**다. 프로젝트마다 서로 다른 Python
버전과 라이브러리를 분리해서 설치할 수 있다. 예를 들어 오래된 프로젝트에서는
Python 3.10을 사용하고, 새 프로젝트에서는 Python 3.12를 사용하는 식이다.

Conda는 Python 패키지만 다루는 것이 아니다. 필요하다면 C, C++, Fortran으로
작성된 라이브러리와 시스템 수준의 의존성도 함께 설치한다. 자세한 개념은
[Conda 공식 소개](https://www.anaconda.com/docs/getting-started/concepts/what-is-conda)에서
확인할 수 있다.

### Miniconda

Miniconda는 Conda를 설치하는 **가벼운 배포판**이다. Conda, Python과 이들이
실행되는 데 필요한 최소 패키지만 포함한다. 수백 개의 데이터 과학 패키지가
미리 들어 있는 Anaconda Distribution과 달리, 필요한 패키지를 사용자가 직접
선택해서 설치한다.

즉, Miniconda를 설치하면 `conda` 명령을 사용할 수 있게 된다. 공식 비교는
[Anaconda와 Miniconda 선택 안내](https://www.anaconda.com/docs/getting-started/concepts/anaconda-or-miniconda)에
정리되어 있다.

### Micromamba

Micromamba는 Conda 패키지와 환경 형식을 사용하는 작은 독립 실행 파일이다.
자체 Python을 필요로 하지 않고, 처음부터 채워진 `base` 환경도 없다. 설치가
작고 단순해서 원격 서버, 컨테이너와 CI 환경에서 특히 편리하다.

다만 Conda와 명령이 매우 비슷할 뿐 모든 기능이 완전히 같은 것은 아니다.
[Micromamba 사용자 안내](https://mamba.readthedocs.io/en/stable/user_guide/micromamba.html)에서도
Conda 명령의 일부를 지원하는 별도 CLI라고 설명한다.

| 구분 | Miniconda + Conda | Micromamba |
| --- | --- | --- |
| 설치되는 것 | Conda, Python, 최소 패키지 | 독립 실행 파일 |
| 기본 `base` 환경 | 있음 | 비어 있음 |
| 명령어 | `conda` | `micromamba` |
| 장점 | 자료가 많고 표준적인 사용 방식 | 작고 설치와 실행이 간결함 |
| 추천 상황 | 처음 배우는 로컬 개발 환경 | 서버, 컨테이너, CI, 최소 설치 |

> 처음 환경 관리를 배우는 중이라면 Miniconda가 무난하다. 터미널 사용에 익숙하고
> 작은 설치를 원한다면 Micromamba를 선택해도 된다. **둘 중 하나만 설치하면 된다.**

## 설치 전에 확인하기

이미 설치되어 있는지 먼저 확인한다. 터미널 또는 PowerShell에서 다음 명령을
실행한다.

```bash
conda --version
micromamba --version
```

둘 중 하나가 버전 번호를 출력한다면 해당 도구가 이미 설치된 것이다. 명령을
찾을 수 없다는 메시지가 나온다면 아래 설치 과정으로 넘어간다.

macOS와 Linux에서는 CPU 종류도 확인해 두는 것이 좋다.

```bash
uname -m
```

- `arm64` 또는 `aarch64`: ARM 계열
- `x86_64`: Intel/AMD 64비트 계열

설치 파일 이름의 `arm64`, `aarch64`, `x86_64`가 자신의 컴퓨터와 맞아야 한다.

## 방법 A: Miniconda 설치하기

### Windows

1. [Miniconda 다운로드 페이지](https://www.anaconda.com/download/success)로 이동한다.
2. Windows 64-bit Graphical Installer를 내려받는다.
3. 설치 파일을 실행하고 설치 대상을 **Just Me**로 선택한다.
4. `Add Miniconda3 to my PATH environment variable`은 선택하지 않는다.
5. 설치가 끝나면 시작 메뉴에서 **Anaconda Prompt**를 연다.
6. 다음 명령으로 설치를 확인한다.

```powershell
conda --version
conda info
```

Anaconda는 현재 사용자에게 설치하는 방식을 권장하며, Windows의 PATH에 Conda를
항상 추가하는 옵션은 다른 프로그램과 충돌할 수 있어 권장하지 않는다. 자세한
화면별 설명은 [Windows 공식 설치 안내](https://www.anaconda.com/docs/getting-started/miniconda/install/windows-gui-install)에서
볼 수 있다.

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

설치 도중 라이선스에 동의하고, `conda init`을 실행할지 묻는 질문에는 `yes`를
선택한다. 설치 후 새 터미널을 열거나 다음 명령을 실행한다.

```bash
source ~/.zshrc
```

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

공식 주소에서 설치 스크립트를 받아 현재 shell로 실행하는 명령이다. 질문에 따라
설치 위치와 shell 초기화를 설정한 뒤 터미널을 다시 열고 확인한다.

```bash
micromamba --version
micromamba info
```

Homebrew를 사용하는 macOS에서는 다음 한 줄로도 설치할 수 있다.

```bash
brew install micromamba
```

설치 후 zsh에서 환경 활성화가 되지 않는다면 shell을 초기화한다.

```bash
micromamba shell init -s zsh -r ~/micromamba
source ~/.zshrc
```

### Windows PowerShell

PowerShell을 열고 공식 설치 스크립트를 실행한다.

```powershell
Invoke-Expression ((Invoke-WebRequest -Uri https://micro.mamba.pm/install.ps1).Content)
```

설치가 끝나면 PowerShell을 다시 열고 확인한다.

```powershell
micromamba --version
micromamba info
```

자동 설치와 수동 설치 방법은 [Micromamba 공식 설치 문서](https://mamba.readthedocs.io/en/stable/installation/micromamba-installation.html)에서
확인할 수 있다.

## 채널 설정하기

채널은 Conda 패키지를 내려받는 저장소다. 이 글에서는 다양한 과학·Python
패키지를 제공하는 `conda-forge`를 사용한다. 서로 다른 채널을 무분별하게
혼합하면 의존성 문제가 생길 수 있으므로 우선순위를 엄격하게 설정한다.

Miniconda를 설치했다면:

```bash
conda config --add channels conda-forge
conda config --set channel_priority strict
```

Micromamba를 설치했다면:

```bash
micromamba config append channels conda-forge
micromamba config set channel_priority strict
```

## 첫 환경 만들기

이제 `study`라는 독립 환경에 Python 3.12, NumPy, Matplotlib, JupyterLab과
IPython kernel을 설치해 보자.

Miniconda를 선택한 경우:

```bash
conda create -n study python=3.12 numpy matplotlib jupyterlab ipykernel -y
conda activate study
```

Micromamba를 선택한 경우:

```bash
micromamba create -n study python=3.12 numpy matplotlib jupyterlab ipykernel -y
micromamba activate study
```

터미널 앞에 `(study)`가 표시되면 환경이 활성화된 것이다. Python과 NumPy가
제대로 설치되었는지 확인한다.

```bash
python --version
python -c "import numpy; print(numpy.__version__)"
```

간단한 계산도 실행해 볼 수 있다.

```bash
python -c "import numpy as np; print(np.arange(5) ** 2)"
```

다음과 같은 결과가 나오면 정상이다.

```text
[ 0  1  4  9 16]
```

## JupyterLab 실행하기

`study` 환경을 활성화한 상태에서 실행한다.

```bash
jupyter lab
```

브라우저가 열리면 새 notebook을 만들고 kernel이 `study` 환경의 Python인지
확인한다. 작업을 마치면 Jupyter가 실행 중인 터미널에서 `Ctrl+C`를 눌러
종료한다.

VS Code를 사용한다면 Microsoft의 Python과 Jupyter 확장을 설치한 뒤,
Command Palette에서 `Python: Select Interpreter` 또는 notebook 오른쪽 위의
kernel 선택 메뉴를 열어 `study` 환경을 선택한다.

## 자주 사용하는 명령

| 작업 | Conda | Micromamba |
| --- | --- | --- |
| 환경 목록 | `conda env list` | `micromamba env list` |
| 환경 활성화 | `conda activate study` | `micromamba activate study` |
| 환경 비활성화 | `conda deactivate` | `micromamba deactivate` |
| 패키지 목록 | `conda list -n study` | `micromamba list -n study` |
| 패키지 설치 | `conda install -n study scipy` | `micromamba install -n study scipy` |
| 환경 삭제 | `conda env remove -n study` | `micromamba env remove -n study` |

환경을 삭제하기 전에는 먼저 비활성화한다.

```bash
conda deactivate
```

또는:

```bash
micromamba deactivate
```

## Conda와 pip를 함께 사용할 때

Conda 환경 안에서 `pip`를 사용할 수 있지만 순서가 중요하다.

1. 가능한 패키지는 먼저 Conda로 설치한다.
2. Conda 채널에 없는 패키지만 마지막에 `pip`로 설치한다.
3. `pip`를 사용한 뒤 다시 많은 Conda 패키지를 추가하기보다 환경을 새로 만드는
   편이 안전하다.

```bash
conda activate study
conda install pip
python -m pip install package-name
```

공식 문서도 Conda와 pip를 섞을 때 격리된 환경을 사용하고 Conda 설치를 먼저
끝낼 것을 권장한다. 자세한 내용은
[Conda 환경 관리 문서](https://docs.conda.io/projects/conda/en/stable/user-guide/tasks/manage-environments.html)에서
확인할 수 있다.

## 자주 막히는 지점

### `conda: command not found`

설치 직후라면 터미널을 완전히 닫았다가 다시 연다. 그래도 안 된다면 Miniconda가
설치된 경로에서 shell 초기화를 다시 실행한다.

```bash
~/miniconda3/bin/conda init
```

macOS의 그래픽 설치 위치가 `/opt/miniconda3`라면 다음 경로일 수 있다.

```bash
/opt/miniconda3/bin/conda init
```

### `micromamba activate`가 동작하지 않음

사용 중인 shell에 맞게 초기화한 뒤 터미널 설정을 다시 불러온다.

```bash
micromamba shell init -s zsh -r ~/micromamba
source ~/.zshrc
```

Bash 사용자는 `zsh`와 `.zshrc`를 각각 `bash`와 `.bashrc`로 바꾼다.

### 터미널을 열 때마다 `(base)`가 표시됨

Miniconda의 base 환경이 자동으로 활성화된 상태다. 오류는 아니지만 원하지 않으면
끄고, 프로젝트 환경만 필요할 때 활성화할 수 있다.

```bash
conda config --set auto_activate_base false
```

### 모든 패키지를 base에 설치해도 될까?

권장하지 않는다. base는 환경 관리 도구 자체가 있는 곳으로 두고, 프로젝트마다
`study`, `cosmology`, `ml-project`처럼 별도 환경을 만드는 습관이 좋다.

## 그래서 무엇을 선택해야 할까

처음 Python 환경을 관리하고 공식 자료를 따라가고 싶다면 **Miniconda**가 편하다.
설치 크기를 줄이고 싶거나 원격 서버, 컨테이너와 자동화 환경을 자주 사용한다면
**Micromamba**가 잘 맞는다.

Micromamba를 단순히 “빠른 Conda”라고만 이해할 필요는 없다. 최신 Conda 역시
Mamba 프로젝트에서 개발된 `libmamba` solver를 기본으로 사용한다. 따라서 현재의
차이는 속도 하나보다는 설치 구조, base 환경의 유무, CLI 호환 범위와 사용
맥락에서 찾는 편이 정확하다. 관련 배경은
[Conda의 libmamba 기본 solver 전환 안내](https://conda.org/blog/2023-11-06-conda-23-10-0-release/)에서
볼 수 있다.

무엇을 선택하든 가장 중요한 원칙은 같다. **프로젝트마다 환경을 하나씩 만들고,
base 환경에는 가능한 한 손대지 않으며, 환경을 다시 만들 수 있도록 필요한
패키지를 기록해 두는 것**이다.

## 참고 문서

- [Conda 공식 사용자 안내](https://docs.conda.io/projects/conda/en/stable/user-guide/)
- [Miniconda 시스템 요구 사항](https://www.anaconda.com/docs/getting-started/miniconda/system-requirements)
- [Miniconda 운영체제별 설치](https://www.anaconda.com/docs/getting-started/miniconda/install)
- [Micromamba 설치](https://mamba.readthedocs.io/en/stable/installation/micromamba-installation.html)
- [Micromamba 사용자 안내](https://mamba.readthedocs.io/en/stable/user_guide/micromamba.html)
