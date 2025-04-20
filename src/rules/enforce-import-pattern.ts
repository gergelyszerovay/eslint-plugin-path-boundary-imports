import { Rule } from "eslint";
import { dirname, join, relative } from "path";
import { getImport } from "../utils";
import { AliasItem } from "../utils/config";
import { isRelativeToParent } from "../utils/import-types";
import { RuleSettings } from "./types";

/**
 * Creates an absolute path to target using an array of alias items
 * @param {string} target
 * @param {AliasItem[]} aliases
 * @returns {string} - absolute path to target
 */
function getAbsolutePathToTarget(
  target: string,
  aliases: AliasItem[] = []
): string {
  if (!target || !aliases) {
    return "";
  }
  const absolutePath = aliases
    .map(({ path, alias }) => `${alias || ""}${relative(path, target)}`)
    .filter((path) => !isRelativeToParent(path) && path.indexOf("..") === -1);

  return (absolutePath && absolutePath[0]) || "";
}

/**
 * Replace all backslashes (\) with forward slashes (/)
 * @param {string} path
 * @returns {string} - path with forward slashes
 */
function replaceBackSlashesWithForward(path: string): string {
  if (!path) {
    return "";
  }
  return path.replace(/\\/g, "/");
}

/**
 * Splits a string before the nth occurrence of a slash (/).
 *
 * @param str - The input string to be split.
 * @param n - The occurrence number of the slash to split before (1-based index).
 * @returns The substring of the original string before the nth slash.
 *          Returns the original string if:
 *          - n is less than or equal to 0
 *          - n is greater than the number of slashes in the string
 *
 * @example
 * // Returns '@features'
 * splitBeforeNthSlash('@features/rest-server/setupRestServer', 1);
 *
 * @example
 * // Returns '@features/rest-server'
 * splitBeforeNthSlash('@features/rest-server/setupRestServer', 2);
 */
function splitBeforeNthSlash(str: string, n: number): string {
  if (n <= 0) {
    return str; // Return the original string for invalid n values
  }

  let position = -1;

  // Find the position of the nth slash
  for (let i = 0; i < n; i++) {
    position = str.indexOf("/", position + 1);

    // If we can't find the nth slash, return the original string
    if (position === -1) {
      return str;
    }
  }

  // Return the substring before the nth slash
  return str.substring(0, position);
}

/**
 * Rule to enforce import rules
 * @param {Rule.RuleContext} context
 * @returns
 */
function enforeImportPatternCreate(context: Rule.RuleContext) {
  const { levels = 2 } = context.options[0] || {};
  const settings: RuleSettings = { levels };

  return getImport(
    context,
    ({ node, start, value: current, end, path, configSettings, filename }) => {
      let expected = replaceBackSlashesWithForward(
        getAbsolutePathToTarget(path, configSettings)
      );
      const absFileName = replaceBackSlashesWithForward(
        getAbsolutePathToTarget(filename, configSettings)
      );
      if (absFileName === "") {
        return;
      }
      const absFilePathAlias = splitBeforeNthSlash(
        absFileName,
        settings.levels
      );
      const rootPath = filename.substring(
        0,
        filename.length - absFileName.length
      );
      // console.log({
      //   filename,
      //   rootPath,
      //   absFileName,
      //   absFilePathAlias,
      //   expected,
      //   current,
      // });
      if (current.indexOf(absFilePathAlias) === 0) {
        // filename: 'src/features/rest-server/internal/configureErrorHandling.ts',
        // current: '@features/rest-server/setupRestServer',
        // import { setupRestServer } from "@features/rest-server/setupRestServer";
        expected = relative(
          dirname(filename),
          join(rootPath, current.substring(1))
        );
        if (expected.indexOf("/") !== -1 && expected[0] !== ".") {
          expected = "./" + expected;
        }
      } else if (expected.indexOf(absFilePathAlias) === 0) {
        // filename: '/workspaces/private-mcp-aib-dev/volume/public/src/features/rest-server/internal/configureErrorHandling.ts',
        // current: '../setupRestServer'
        // import { setupRestServer } from "../setupRestServer";
        if (current[0] === ".") {
          return;
        }
      } else {
        if (expected === "") {
          return;
        }
      }
      // console.log({ current, expected });

      const data = {
        current,
        expected,
      };

      const fix = (fixer: Rule.RuleFixer): Rule.Fix =>
        fixer.replaceTextRange([start + 1, end - 1], expected);

      const descriptor = {
        node,
        messageId: "noRelativeImports",
        data,
        fix,
        suggest: [
          {
            messageId: "replaceRelativeImport",
            data,
            fix,
          },
        ],
      };

      context.report(descriptor);
    }
  );
}

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "",
      url: "",
    },
    fixable: "code",
    hasSuggestions: true,
    schema: [
      {
        type: "object",
        properties: {
          levels: {
            type: "number",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noRelativeImports:
        "Import path '{{current}}' should be replaced with '{{expected}}'",
      replaceRelativeImport:
        "Replace import path '{{current}}' with '{{expected}}'",
    },
  },
  create: enforeImportPatternCreate,
};

export default rule;
