import { VisibleIf, VisibilityCondition, AnswersMap, QuizValue } from './types';

/**
 * Checks if a section or question should be visible based on its visibility rules
 * and the current answers.
 */
export function isVisible(
  visibleIf: VisibleIf | null | undefined,
  answers: AnswersMap
): boolean {
  // If no visibility rules, always visible
  if (!visibleIf) {
    return true;
  }

  // Check "all" conditions (AND logic)
  if (visibleIf.all && visibleIf.all.length > 0) {
    const allMatch = visibleIf.all.every((condition) =>
      evaluateCondition(condition, answers)
    );
    if (!allMatch) {
      return false;
    }
  }

  // Check "any" conditions (OR logic)
  if (visibleIf.any && visibleIf.any.length > 0) {
    const anyMatch = visibleIf.any.some((condition) =>
      evaluateCondition(condition, answers)
    );
    if (!anyMatch) {
      return false;
    }
  }

  return true;
}

/**
 * Evaluates a single visibility condition
 */
function evaluateCondition(
  condition: VisibilityCondition,
  answers: AnswersMap
): boolean {
  const { q, op, value: targetValue } = condition;
  const answer = answers[q];

  // If question hasn't been answered, condition fails
  if (!answer) {
    return false;
  }

  // Extract the actual value(s) from the answer
  let actualValue: string | number | boolean | string[];

  if ('value' in answer) {
    actualValue = answer.value;
  } else if ('values' in answer) {
    actualValue = answer.values;
  } else {
    return false;
  }

  // Evaluate based on operator
  switch (op) {
    case 'eq':
      return actualValue === targetValue;

    case 'neq':
      return actualValue !== targetValue;

    case 'in':
      // For single value, check if it's in the target array
      if (!Array.isArray(actualValue)) {
        return Array.isArray(targetValue) && targetValue.includes(String(actualValue));
      }
      // For array values (multi-choice), check if any value is in target array
      return actualValue.some((v: string) =>
        Array.isArray(targetValue) ? targetValue.includes(v) : v === targetValue
      );

    case 'nin':
      // For single value, check if it's NOT in the target array
      if (!Array.isArray(actualValue)) {
        return !(Array.isArray(targetValue) && targetValue.includes(String(actualValue)));
      }
      // For array values, check if NO value is in target array
      return !actualValue.some((v: string) =>
        Array.isArray(targetValue) ? targetValue.includes(v) : v === targetValue
      );

    default:
      console.warn(`Unknown visibility operator: ${op}`);
      return false;
  }
}

/**
 * Builds an answers map from quiz responses
 */
export function buildAnswersMap(
  responses: Array<{ question_id: string; value: QuizValue }>,
  questions: Array<{ id: string; key: string }>
): AnswersMap {
  const questionIdToKey = new Map(questions.map((q) => [q.id, q.key]));
  const answersMap: AnswersMap = {};

  for (const response of responses) {
    const questionKey = questionIdToKey.get(response.question_id);
    if (questionKey) {
      answersMap[questionKey] = response.value;
    }
  }

  return answersMap;
}

