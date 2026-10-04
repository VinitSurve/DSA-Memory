import { supabase } from './src/services/supabase';

async function fixP4P5() {
  const p4Id = 'fe8a2459-feb5-4e5d-98c7-91798959535b';
  const swapCaseCode = `def swap_case(s):
    result = []
    for char in s:
        if char.isupper():
            result.append(char.lower())
        elif char.islower():
            result.append(char.upper())
        else:
            result.append(char)
    return "".join(result)

if __name__ == '__main__':
    s = input()
    result = swap_case(s)
    print(result)`;

  const { data: d4, error: e4 } = await supabase.from('submissions').insert({
    problem_id: p4Id,
    solution_code: swapCaseCode,
    language: 'Python 3',
    submission_fingerprint: 'swap_case_fingerprint_01',
    submitted_at: new Date(Date.now() + 10000000).toISOString()
  }).select();

  console.log("Insert P4 result:", d4, "Error:", e4);

  const p5Id = 'aca75217-c207-49fd-8261-32f4f87f4e7d';
  const leapYearCode = `def is_leap(year):
    leap = False
    
    if year % 4 == 0:
        if year % 100 == 0:
            if year % 400 == 0:
                leap = True
            else:
                leap = False
        else:
            leap = True
            
    return leap

year = int(input())
print(is_leap(year))`;

  const { data: d5, error: e5 } = await supabase.from('submissions').insert({
    problem_id: p5Id,
    solution_code: leapYearCode,
    language: 'Python 3',
    submission_fingerprint: 'leap_year_fingerprint_01',
    submitted_at: new Date(Date.now() + 10000000).toISOString()
  }).select();

  console.log("Insert P5 result:", d5, "Error:", e5);
}

fixP4P5();
