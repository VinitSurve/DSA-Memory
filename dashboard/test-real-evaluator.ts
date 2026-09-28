import { evaluateRecall } from './src/services/evaluator';

const referenceCode = `if __name__ == '__main__':
    n = int(input())
    student_marks = {}
    for _ in range(n):
        name, *line = input().split()
        scores = list(map(float, line))
        student_marks[name] = scores
    query_name = input()
    marks = student_marks[query_name]
    avg = sum(marks) / len(marks)
    print(f"{avg:.2f}")`;

async function runTest(name: string, approach: string, time: string, space: string) {
  console.log(`\n--- Test: ${name} ---`);
  const result = await evaluateRecall('Finding the percentage', approach, time, space, referenceCode, 'Python 3');
  console.log(JSON.stringify(result, null, 2));
}

async function main() {
  const t1 = `Approach:
Store each student's marks in a dictionary using their name as the key.
Read the queried student's marks, calculate their sum, divide by the
number of marks, and print the result rounded to 2 decimal places.`;

  const t2 = `Approach:
Store the students in a dictionary and find the queried student's marks.
I know I need to calculate the average, but I'm not sure whether I should
divide by the number of students or the number of marks.`;

  const t3 = `Approach:
Sort all students by their marks and print the highest student's average.`;

  const t4 = `Approach:
Read all student records and immediately calculate the average for each
student while storing only the calculated average instead of the complete
marks list. Then print the average for the queried student.`;

  await runTest('1. Correct', t1, 'O(N)', 'O(N)');
  await runTest('2. Partially correct', t2, 'O(N)', 'O(N)');
  await runTest('3. Incorrect', t3, 'O(1)', 'O(1)');
  await runTest('4. Different but valid approach', t4, 'O(N)', 'O(N)');
}

main().catch(console.error);
