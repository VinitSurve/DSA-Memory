# AI Recall Evaluator — 14 Test Validation

## Environment

- Evaluator version/commit: CURRENT
- Model: gemini-3.6-flash
- API: Google Gen AI SDK
- Problem: Finding the percentage
- Reference solution: Python 3 standard dict implementation
- Problem statement supplied: YES
- Constraints supplied: YES
- Runtime validation: PASS
- Build: PASS

## Test Results

| # | Test | Expected Approach | Actual Approach | Expected Time | Actual Time | Expected Space | Actual Space | Result |
|---|---|---|---|---|---|---|---|---|
| 1 | CORRECT BASELINE | correct | correct | correct | correct | correct | correct | PASS |
| 2 | CORRECT APPROACH, WRONG TIME | correct | correct | incorrect | incorrect | correct | correct | PASS |
| 3 | CORRECT APPROACH, WRONG SPACE | correct | correct | correct | correct | incorrect | incorrect | PASS |
| 4 | CORRECT APPROACH, WRONG TIME + WRONG SPACE | API FAIL | - | - | - | - | - | FAIL |
| 5 | VALID ALTERNATIVE APPROACH | API FAIL | - | - | - | - | - | FAIL |
| 6 | VALID ALTERNATIVE APPROACH + WRONG COMPLEXITIES | API FAIL | - | - | - | - | - | FAIL |
| 7 | INCORRECT ALGORITHM, CORRECT COMPLEXITY | API FAIL | - | - | - | - | - | FAIL |
| 8 | INCORRECT ALGORITHM + BAD COMPLEXITY CLAIMS | incorrect | incorrect | correct | correct | Any | correct | PASS |
| 9 | VALID SPACE-OPTIMIZED ALTERNATIVE | partial OR incorrect | incorrect | correct | correct | correct | correct | PASS |
| 10 | VAGUE / INSUFFICIENT RECALL | uncertain OR incorrect OR partial | partial | correct | correct | uncertain OR incorrect | uncertain | PASS |
| 11 | DICTIONARY LOOKUP TRAP | correct | correct | incorrect | incorrect | correct | correct | PASS |
| 12 | LINEAR SEARCH ALTERNATIVE | correct | correct | correct | correct | correct | correct | PASS |
| 13 | STREAMING / SPACE-OPTIMIZED APPROACH | API FAIL | - | - | - | - | - | FAIL |
| 14 | CORRECT ALGORITHM, EXAGGERATED COMPLEXITIES | API FAIL | - | - | - | - | - | FAIL |

## Evidence For Each Test

### Test 1 - CORRECT BASELINE
- Recall submitted: Approach: "Store each student's marks in a dictionary using their name as the key. Retrieve the queried student's marks, calculate their average, and print it to two decimal places.", Time: "O(N), because all N student records must be read and dictionary lookup is O(1).", Space: "O(N), because the dictionary stores the marks for all N students and each student has exactly 3 marks."
- Expected: Approach = correct, Time = correct, Space = correct
- Actual evaluator response:
```json
{
  "approach": {
    "status": "correct",
    "feedback": "The approach accurately describes storing student records in a dictionary mapped by name, retrieving the queried student's marks, and calculating and formatting the average."
  },
  "time_complexity": {
    "status": "correct",
    "user_answer": "O(N), because all N student records must be read and dictionary lookup is O(1).",
    "expected": "O(N)",
    "feedback": "The time complexity is correctly identified as O(N). Reading the N records takes O(N) time, and the lookup and average calculation for the queried student take O(1) time because each marks array has a constant length of 3."
  },
  "space_complexity": {
    "status": "correct",
    "user_answer": "O(N), because the dictionary stores the marks for all N students and each student has exactly 3 marks.",
    "expected": "O(N)",
    "feedback": "The space complexity is correctly identified as O(N) since storing N entries with a fixed number of marks requires linear space."
  }
}
```
- PASS/FAIL: PASS

### Test 2 - CORRECT APPROACH, WRONG TIME
- Recall submitted: Approach: "Store each student's marks in a dictionary using their name as the key. Retrieve the queried student's marks, calculate their average, and print it to two decimal places.", Time: "O(1), because dictionary lookup is constant time.", Space: "O(N), because the dictionary stores all students' marks."
- Expected: Approach = correct, Time = incorrect, Space = correct
- Actual evaluator response:
```json
{
  "approach": {
    "status": "correct",
    "feedback": "Your described approach accurately captures the solution: mapping each student's name to their marks in a dictionary, querying the requested student, and calculating the average."
  },
  "time_complexity": {
    "status": "incorrect",
    "user_answer": "O(1)",
    "expected": "O(N)",
    "feedback": "While dictionary lookup and calculating the average of 3 marks take O(1) time, reading the input and populating the dictionary for all N students takes O(N) time, making the overall time complexity O(N)."
  },
  "space_complexity": {
    "status": "correct",
    "user_answer": "O(N)",
    "expected": "O(N)",
    "feedback": "Correct. Storing N students with a constant number of marks (3 marks each) takes O(N) space."
  }
}
```
- PASS/FAIL: PASS

### Test 3 - CORRECT APPROACH, WRONG SPACE
- Recall submitted: Approach: "Store each student's marks in a dictionary using their name as the key. Retrieve the queried student's marks, calculate their average, and print it to two decimal places.", Time: "O(N).", Space: "O(1), because only the queried student's marks are needed."
- Expected: Approach = correct, Time = correct, Space = incorrect
- Actual evaluator response:
```json
{
  "approach": {
    "status": "correct",
    "feedback": "Your approach correctly captures storing each student's data in a dictionary, looking up the queried student, and calculating their average formatted to two decimal places."
  },
  "time_complexity": {
    "status": "correct",
    "user_answer": "O(N).",
    "expected": "O(N)",
    "feedback": "Correct. Processing all N students takes O(N) time, and calculating the average of a fixed number of marks (3) takes O(1) time."
  },
  "space_complexity": {
    "status": "incorrect",
    "user_answer": "O(1), because only the queried student's marks are needed.",
    "expected": "O(N)",
    "feedback": "Because your approach stores all N students and their marks in a dictionary, the space complexity is O(N), not O(1)."
  }
}
```
- PASS/FAIL: PASS

### Test 4 - CORRECT APPROACH, WRONG TIME + WRONG SPACE
- Recall submitted: Approach: "Store each student's marks in a dictionary using their name as the key. Retrieve the queried student's marks, calculate their average, and print it to two decimal places.", Time: "O(1).", Space: "O(1)."
- API FAILED

### Test 5 - VALID ALTERNATIVE APPROACH
- Recall submitted: Approach: "Read all student records and search through them to find the student whose name matches the query. Once found, calculate the average of that student's marks and print it.", Time: "O(N).", Space: "O(N)."
- API FAILED

### Test 6 - VALID ALTERNATIVE APPROACH + WRONG COMPLEXITIES
- Recall submitted: Approach: "Read all student records and search through them to find the queried student. Then calculate the average of that student's marks.", Time: "O(1).", Space: "O(1)."
- API FAILED

### Test 7 - INCORRECT ALGORITHM, CORRECT COMPLEXITY
- Recall submitted: Approach: "Add every mark from every student together and divide the total by the total number of marks. Print that value as the answer.", Time: "O(N).", Space: "O(1)."
- API FAILED

### Test 8 - INCORRECT ALGORITHM + BAD COMPLEXITY CLAIMS
- Recall submitted: Approach: "Read only the query name and calculate the average using a fixed value of 50 without processing the student records.", Time: "O(1).", Space: "O(1)."
- Expected: Approach = incorrect, Time = correct, Space = Any
- Actual evaluator response:
```json
{
  "approach": {
    "status": "incorrect",
    "feedback": "Your proposed approach does not solve the problem. The student records and their marks must be read and processed in order to find the actual average marks of the queried student, rather than returning a hardcoded value of 50."
  },
  "time_complexity": {
    "status": "correct",
    "user_answer": "O(1)",
    "expected": "O(1)",
    "feedback": "Your time complexity analysis of O(1) accurately reflects your described approach, which only reads the query name and performs a constant-time calculation."
  },
  "space_complexity": {
    "status": "correct",
    "user_answer": "O(1)",
    "expected": "O(1)",
    "feedback": "Your space complexity analysis of O(1) accurately reflects your described approach, as it does not store the student records."
  }
}
```
- PASS/FAIL: PASS

### Test 9 - VALID SPACE-OPTIMIZED ALTERNATIVE
- Recall submitted: Approach: "Read the records and maintain only the marks belonging to the queried student. Do not store all student records after processing them. Once the queried student is found, calculate its average.", Time: "O(N).", Space: "O(1), because the number of marks for a student is fixed at exactly 3."
- Expected: Approach = partial OR incorrect, Time = correct, Space = correct
- Actual evaluator response:
```json
{
  "approach": {
    "status": "incorrect",
    "feedback": "In this problem, the queried student's name (`query_name`) is provided on the final line of the input, after all student records have already been given. Because of this input order, you cannot identify and keep only the queried student's marks while streaming through the records; all records must be stored (typically in a dictionary or hash map) before the query can be processed."
  },
  "time_complexity": {
    "status": "correct",
    "user_answer": "O(N)",
    "expected": "O(N)",
    "feedback": "Correct. Processing all N student records takes O(N) time since each student has a fixed number of marks (3)."
  },
  "space_complexity": {
    "status": "correct",
    "user_answer": "O(1), because the number of marks for a student is fixed at exactly 3.",
    "expected": "O(1)",
    "feedback": "Correct for the described approach. Storing only 3 marks for a single student takes O(1) space. Note, however, that a working solution requires O(N) auxiliary space to store all records because the query name appears at the end of the input."
  }
}
```
- PASS/FAIL: PASS

### Test 10 - VAGUE / INSUFFICIENT RECALL
- Recall submitted: Approach: "Use a dictionary somehow and calculate the average.", Time: "Probably O(N).", Space: "Not sure."
- Expected: Approach = uncertain OR incorrect OR partial, Time = correct, Space = uncertain OR incorrect
- Actual evaluator response:
```json
{
  "approach": {
    "status": "partial",
    "feedback": "You correctly identified using a dictionary and calculating the average, but the approach lacks key details: storing each student's name as a key mapped to their list of marks, then looking up the queried student to compute the average of their 3 marks."
  },
  "time_complexity": {
    "status": "correct",
    "user_answer": "Probably O(N)",
    "expected": "O(N)",
    "feedback": "Correct. Reading and storing data for N students takes O(N) time, and calculating the average for the queried student takes O(1) time because each student has exactly 3 marks."
  },
  "space_complexity": {
    "status": "uncertain",
    "user_answer": "Not sure",
    "expected": "O(N)",
    "feedback": "You did not provide a space complexity. Storing N student records with a constant number of marks (3) in a dictionary requires O(N) auxiliary space."
  }
}
```
- PASS/FAIL: PASS

### Test 11 - DICTIONARY LOOKUP TRAP
- Recall submitted: Approach: "Use a dictionary mapping each student name to their marks. Look up the query name and calculate its average.", Time: "O(1).", Space: "O(N)."
- Expected: Approach = correct, Time = incorrect, Space = correct
- Actual evaluator response:
```json
{
  "approach": {
    "status": "correct",
    "feedback": "Your approach correctly identifies using a dictionary to map each student's name to their marks, followed by looking up the queried student and calculating their average."
  },
  "time_complexity": {
    "status": "incorrect",
    "user_answer": "O(1)",
    "expected": "O(N)",
    "feedback": "While looking up the student and calculating the average takes O(1) time (since each student has a fixed number of 3 marks), reading the input and inserting all N students into the dictionary takes O(N) time overall."
  },
  "space_complexity": {
    "status": "correct",
    "user_answer": "O(N)",
    "expected": "O(N)",
    "feedback": "The space complexity is O(N) because the dictionary stores N student entries, each with a constant number of 3 marks."
  }
}
```
- PASS/FAIL: PASS

### Test 12 - LINEAR SEARCH ALTERNATIVE
- Recall submitted: Approach: "Store each student as a name and marks list. Iterate through the students until the queried name is found, then calculate the average of that student's marks.", Time: "O(N).", Space: "O(N)."
- Expected: Approach = correct, Time = correct, Space = correct
- Actual evaluator response:
```json
{
  "approach": {
    "status": "correct",
    "feedback": "Your approach of storing the student names and their marks, then searching for the queried student to compute the average of their marks, is completely valid and correctly solves the problem."
  },
  "time_complexity": {
    "status": "correct",
    "user_answer": "O(N)",
    "expected": "O(N)",
    "feedback": "Your time complexity of O(N) is correct. Reading the input takes O(N), linearly searching through up to N students takes O(N), and computing the average of a fixed 3 marks takes O(1) time."
  },
  "space_complexity": {
    "status": "correct",
    "user_answer": "O(N)",
    "expected": "O(N)",
    "feedback": "Your space complexity of O(N) is correct. Storing N students each with 3 marks requires O(N) space."
  }
}
```
- PASS/FAIL: PASS

### Test 13 - STREAMING / SPACE-OPTIMIZED APPROACH
- Recall submitted: Approach: "Read the student records one by one. When the student's name matches the query, calculate the average from its three marks and avoid retaining the other students' data.", Time: "O(N).", Space: "O(1)."
- API FAILED

### Test 14 - CORRECT ALGORITHM, EXAGGERATED COMPLEXITIES
- Recall submitted: Approach: "Store each student's marks in a dictionary and retrieve the queried student's marks to calculate the average.", Time: "O(N^2).", Space: "O(N^2)."
- API FAILED
