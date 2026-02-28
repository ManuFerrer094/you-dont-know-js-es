"""
Script para dividir ficheros Markdown de más de 750 líneas en sub-ficheros.

Recorre la carpeta "texts copy" y, para cada .md con más de 750 líneas,
lo divide en partes (ej. ch3.md → ch3-1.md, ch3-2.md …).

Reglas clave:
  - Nunca corta dentro de un bloque de código (``` … ```).
  - Intenta cortar en encabezados de nivel 2 (##) para mantener secciones completas.
  - Si no hay un ## disponible antes de superar el límite, corta en líneas en blanco
    fuera de bloques de código.
  - El fichero original se elimina tras la división.
"""

import os
import re
import sys
from pathlib import Path

MAX_LINES = 750
# Mínimo de líneas por parte para evitar fragmentos ridículamente pequeños
MIN_LINES = 100

BASE_DIR = Path(__file__).resolve().parent / "texts copy"


def is_code_fence(line: str) -> bool:
    """Detecta si una línea abre/cierra un bloque de código (``` o ~~~)."""
    stripped = line.strip()
    return stripped.startswith("```") or stripped.startswith("~~~")


def find_split_points(lines: list[str]) -> list[int]:
    """
    Devuelve una lista de índices de línea donde es seguro cortar.

    Prioridad:
      1. Encabezados ## (nivel 2) fuera de bloques de código.
      2. Encabezados ### (nivel 3) fuera de bloques de código.
      3. Líneas en blanco fuera de bloques de código.
    """
    h2_points: list[int] = []
    h3_points: list[int] = []
    blank_points: list[int] = []

    in_code_block = False

    for i, line in enumerate(lines):
        if is_code_fence(line):
            in_code_block = not in_code_block
            continue

        if in_code_block:
            continue

        if line.startswith("## "):
            h2_points.append(i)
        elif line.startswith("### "):
            h3_points.append(i)
        elif line.strip() == "":
            blank_points.append(i)

    return h2_points, h3_points, blank_points


def pick_cut(target: int, candidates: list[int], min_pos: int) -> int | None:
    """
    De entre *candidates* (ordenados), elige el punto de corte más cercano a
    *target* que esté >= min_pos.  Devuelve None si no hay candidato válido.
    """
    best = None
    best_dist = float("inf")
    for c in candidates:
        if c < min_pos:
            continue
        dist = abs(c - target)
        if dist < best_dist:
            best = c
            best_dist = dist
        # Como están ordenados y nos alejamos, podemos parar si superamos target
        # con creces
        if c > target + MAX_LINES // 2:
            break
    return best


def split_file(filepath: Path) -> None:
    """Divide un fichero en sub-ficheros de ≤ MAX_LINES líneas."""
    with open(filepath, encoding="utf-8") as f:
        lines = f.readlines()

    total = len(lines)
    if total <= MAX_LINES:
        return  # nada que hacer

    h2_pts, h3_pts, blank_pts = find_split_points(lines)

    # Construir las partes
    parts: list[list[str]] = []
    start = 0

    while start < total:
        remaining = total - start
        if remaining <= MAX_LINES:
            # Lo que queda cabe en una parte
            parts.append(lines[start:])
            break

        target = start + MAX_LINES
        min_pos = start + MIN_LINES  # no cortar demasiado pronto

        # 1. Intentar cortar en un ## antes de target
        cut = pick_cut(target, h2_pts, min_pos)

        # 2. Si no, intentar en ###
        if cut is None or cut <= start:
            cut = pick_cut(target, h3_pts, min_pos)

        # 3. Si no, en línea en blanco
        if cut is None or cut <= start:
            cut = pick_cut(target, blank_pts, min_pos)

        # 4. Fallback: cortar justo en target (buscar línea en blanco cercana)
        if cut is None or cut <= start:
            # Buscar la línea en blanco más cercana a target fuera de code block
            in_code = False
            for i in range(start, min(target + 200, total)):
                if is_code_fence(lines[i]):
                    in_code = not in_code
                if not in_code and lines[i].strip() == "" and i >= min_pos:
                    cut = i
                    if i >= target:
                        break
            # Si sigue sin encontrar, forzar en target
            if cut is None or cut <= start:
                cut = target

        # Verificar que no cortamos dentro de un bloque de código
        in_code = False
        for i in range(start, cut):
            if is_code_fence(lines[i]):
                in_code = not in_code
        if in_code:
            # Estamos dentro de un code block en la posición cut.
            # Avanzar hasta cerrar el bloque.
            for i in range(cut, total):
                if is_code_fence(lines[i]):
                    cut = i + 1  # cortar justo después del cierre
                    break
            # Después del cierre, buscar la siguiente línea en blanco para cortar limpio
            for i in range(cut, min(cut + 20, total)):
                if lines[i].strip() == "":
                    cut = i + 1
                    break

        parts.append(lines[start:cut])
        start = cut

    if len(parts) <= 1:
        return  # no se pudo dividir

    # Determinar nombre base: ch3.md → ch3, apA.md → apA
    stem = filepath.stem  # ej. "ch3"
    suffix = filepath.suffix  # ".md"
    parent = filepath.parent

    for idx, part in enumerate(parts, start=1):
        new_name = f"{stem}-{idx}{suffix}"
        new_path = parent / new_name
        with open(new_path, "w", encoding="utf-8") as f:
            f.writelines(part)
        line_count = len(part)
        print(f"  Creado: {new_path.relative_to(BASE_DIR)}  ({line_count} líneas)")

    # Eliminar el original
    filepath.unlink()
    print(f"  Eliminado original: {filepath.relative_to(BASE_DIR)}")


def main() -> None:
    if not BASE_DIR.exists():
        print(f"ERROR: No se encuentra la carpeta '{BASE_DIR}'")
        sys.exit(1)

    print(f"Buscando ficheros .md con más de {MAX_LINES} líneas en: {BASE_DIR}\n")

    found = False
    for root, _dirs, files in os.walk(BASE_DIR):
        for fname in sorted(files):
            if not fname.endswith(".md"):
                continue
            fpath = Path(root) / fname
            with open(fpath, encoding="utf-8") as f:
                line_count = sum(1 for _ in f)
            if line_count > MAX_LINES:
                found = True
                print(f"Dividiendo: {fpath.relative_to(BASE_DIR)}  ({line_count} líneas)")
                split_file(fpath)
                print()

    if not found:
        print("No se encontraron ficheros con más de 750 líneas.")
    else:
        print("¡Listo!")


if __name__ == "__main__":
    main()
