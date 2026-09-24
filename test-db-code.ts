import { getProblemById } from './dashboard/src/services/db';
getProblemById('cf3e6835-3905-4690-9e9a-9ed97f18ecf7').then(res => {
  if (res && res.submissions.length > 0) {
    const code = res.submissions[0].solution_code;
    console.log("Raw JSON stringified code:");
    console.log(JSON.stringify(code));
    console.log("\nCode printed directly:");
    console.log(code);
    console.log("\nContains literal backslash n:", code.includes('\\n'));
  }
}).catch(console.error);
