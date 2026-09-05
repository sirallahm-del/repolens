import ast
import os


def parse_code(code):
    try:
        tree = ast.parse(code)
        return tree
    except SyntaxError:
        return None


def analyze_code(code):
    tree = parse_code(code)

    if tree is None:
        return {
            "error": "Invalid Python code"
        }

    functions = []
    imports = []

    for node in ast.walk(tree):

        if isinstance(node, ast.FunctionDef):
            functions.append(node.name)

        elif isinstance(node, ast.Import):
            for name in node.names:
                imports.append(name.name)

        elif isinstance(node, ast.ImportFrom):
            imports.append(node.module)

    return {
        "functions": functions,
        "imports": imports
    }


def analyze_folder(folder_path):
    results = {}

    for filename in os.listdir(folder_path):

        if filename.endswith(".py") and filename != "parser.py":

            file_path = os.path.join(folder_path, filename)

            with open(file_path, "r") as file:
                code = file.read()

            results[filename] = analyze_code(code)

    return results


def build_dependency_map(results):
    dependency_map = {}

    python_files = []

    for filename in results:
        module_name = filename.replace(".py", "")
        python_files.append(module_name)

    for filename, analysis in results.items():
        dependencies = []

        if "imports" in analysis:
            for imported_module in analysis["imports"]:

                if imported_module in python_files:
                    dependencies.append(imported_module + ".py")

        dependency_map[filename] = dependencies

    return dependency_map


results = analyze_folder("src")

dependency_map = build_dependency_map(results)

print("Analysis:")
print(results)

print("Dependency map:")
print(dependency_map)