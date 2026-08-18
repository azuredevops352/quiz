// Verification script for questions.js data integrity
import { questions } from './src/data/questions.js';

function runVerification() {
  console.log('='.repeat(80));
  console.log('QUESTION BANK VERIFICATION REPORT');
  console.log('='.repeat(80));
  console.log('');

  // =============================================
  // 1. QUESTION COUNT PER CATEGORY + DIFFICULTY
  // =============================================
  console.log('1. QUESTION COUNT PER CATEGORY × DIFFICULTY');
  console.log('-'.repeat(80));
  
  const categories = [...new Set(questions.map(q => q.category))].sort();
  const difficulties = ['Easy', 'Medium', 'Hard'];
  
  const countTable = {};
  let totalQuestions = 0;
  let countIssues = [];
  
  for (const cat of categories) {
    countTable[cat] = {};
    for (const diff of difficulties) {
      const count = questions.filter(q => q.category === cat && q.difficulty === diff).length;
      countTable[cat][diff] = count;
      totalQuestions += count;
      const status = count === 20 ? '✅' : '❌';
      if (count !== 20) {
        countIssues.push(`${cat}-${diff}: ${count} questions (expected 20)`);
      }
      console.log(`  ${status} ${cat}-${diff}: ${count}`);
    }
  }
  
  console.log(`\nTotal questions in bank: ${totalQuestions}`);
  console.log(`Expected total (11 categories × 3 difficulties × 20): ${11 * 3 * 20}`);
  
  if (countIssues.length > 0) {
    console.log('\n⚠️  COUNT ISSUES:');
    countIssues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log('\n✅ All category×difficulty combinations have exactly 20 questions');
  }

  // =============================================
  // 2. DUPLICATE DETECTION
  // =============================================
  console.log('\n' + '='.repeat(80));
  console.log('2. DUPLICATE DETECTION');
  console.log('-'.repeat(80));
  
  // 2a. Duplicate IDs
  const idMap = new Map();
  questions.forEach(q => {
    if (!idMap.has(q.id)) idMap.set(q.id, []);
    idMap.get(q.id).push(q);
  });
  
  const duplicateIds = [];
  idMap.forEach((items, id) => {
    if (items.length > 1) {
      duplicateIds.push({ id, count: items.length, questions: items.map(q => `${q.category}-${q.difficulty}: ${q.answer}`) });
    }
  });
  
  console.log('\n2a. Duplicate IDs:');
  if (duplicateIds.length > 0) {
    duplicateIds.forEach(d => {
      console.log(`  ❌ ID ${d.id} appears ${d.count} times:`);
      d.questions.forEach(q => console.log(`      - ${q}`));
    });
  } else {
    console.log('  ✅ No duplicate IDs found');
  }
  
  // 2b. Duplicate answers within same category+difficulty
  console.log('\n2b. Duplicate answers within same category+difficulty:');
  const answerMap = new Map();
  questions.forEach(q => {
    const key = `${q.category}-${q.difficulty}-${q.answer.toLowerCase()}`;
    if (!answerMap.has(key)) answerMap.set(key, []);
    answerMap.get(key).push(q.id);
  });
  
  const duplicateAnswers = [];
  answerMap.forEach((ids, key) => {
    if (ids.length > 1) {
      const [cat, diff, ans] = key.split('-');
      duplicateAnswers.push({ category: cat, difficulty: diff, answer: ans, ids });
    }
  });
  
  if (duplicateAnswers.length > 0) {
    duplicateAnswers.forEach(d => {
      console.log(`  ❌ ${d.category}-${d.difficulty}: "${d.answer}" appears in questions ${d.ids.join(', ')}`);
    });
  } else {
    console.log('  ✅ No duplicate answers within same category+difficulty');
  }
  
  // 2c. Duplicate clues within same question
  console.log('\n2c. Duplicate/near-duplicate clues within same question:');
  const duplicateCluesInQuestion = [];
  questions.forEach(q => {
    const cluesLower = q.clues.map(c => c.toLowerCase().trim());
    const uniqueClues = new Set(cluesLower);
    if (uniqueClues.size !== cluesLower.length) {
      // Find which clues are duplicates
      const seen = new Set();
      const dupes = cluesLower.filter(c => {
        if (seen.has(c)) return true;
        seen.add(c);
        return false;
      });
      duplicateCluesInQuestion.push({ id: q.id, answer: q.answer, category: q.category, difficulty: q.difficulty, duplicates: dupes });
    }
  });
  
  if (duplicateCluesInQuestion.length > 0) {
    duplicateCluesInQuestion.forEach(d => {
      console.log(`  ❌ Q${d.id} (${d.category}-${d.difficulty}: ${d.answer}): duplicate clues: ${d.duplicates.join(', ')}`);
    });
  } else {
    console.log('  ✅ No duplicate clues within same question');
  }
  
  // 2d. Two different questions sharing 4+ identical/near-identical clues
  console.log('\n2d. Questions sharing 4+ identical/near-identical clues (same category+difficulty):');
  const similarQuestions = [];
  
  for (const cat of categories) {
    for (const diff of difficulties) {
      const catDiffQuestions = questions.filter(q => q.category === cat && q.difficulty === diff);
      
      for (let i = 0; i < catDiffQuestions.length; i++) {
        for (let j = i + 1; j < catDiffQuestions.length; j++) {
          const q1 = catDiffQuestions[i];
          const q2 = catDiffQuestions[j];
          
          // Normalize clues for comparison
          const normalize = (clue) => clue.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
          const clues1 = q1.clues.map(normalize);
          const clues2 = q2.clues.map(normalize);
          
          let matchCount = 0;
          const matchedClues = [];
          
          for (const c1 of clues1) {
            for (const c2 of clues2) {
              if (c1 === c2 || (c1.length > 20 && c2.length > 20 && (c1.includes(c2) || c2.includes(c1)))) {
                matchCount++;
                matchedClues.push(c1);
                break;
              }
            }
          }
          
          if (matchCount >= 4) {
            similarQuestions.push({
              q1: { id: q1.id, answer: q1.answer },
              q2: { id: q2.id, answer: q2.answer },
              category: cat,
              difficulty: diff,
              matchCount,
              matchedClues
            });
          }
        }
      }
    }
  }
  
  if (similarQuestions.length > 0) {
    similarQuestions.forEach(s => {
      console.log(`  ❌ ${s.category}-${s.difficulty}: Q${s.q1.id}("${s.q1.answer}") & Q${s.q2.id}("${s.q2.answer}") share ${s.matchCount} clues`);
      s.matchedClues.forEach(c => console.log(`      - "${c}"`));
    });
  } else {
    console.log('  ✅ No questions sharing 4+ identical clues');
  }

  // =============================================
  // 3. STRUCTURAL VALIDATION
  // =============================================
  console.log('\n' + '='.repeat(80));
  console.log('3. STRUCTURAL VALIDATION');
  console.log('-'.repeat(80));
  
  const structuralIssues = [];
  
  questions.forEach(q => {
    const issues = [];
    
    // Check unique id (already checked above, but verify it's present)
    if (q.id === undefined || q.id === null) {
      issues.push('Missing id');
    }
    
    // Check required fields non-empty
    if (!q.answer || q.answer.trim() === '') {
      issues.push('Empty answer');
    }
    if (!q.category || q.category.trim() === '') {
      issues.push('Empty category');
    }
    if (!q.difficulty || q.difficulty.trim() === '') {
      issues.push('Empty difficulty');
    }
    
    // Check difficulty values
    if (q.difficulty && !['Easy', 'Medium', 'Hard'].includes(q.difficulty)) {
      issues.push(`Invalid difficulty: "${q.difficulty}"`);
    }
    
    // Check clues
    if (!q.clues || !Array.isArray(q.clues)) {
      issues.push('Missing or invalid clues array');
    } else {
      if (q.clues.length !== 5) {
        issues.push(`Expected 5 clues, got ${q.clues.length}`);
      }
      q.clues.forEach((clue, idx) => {
        if (!clue || clue.trim() === '') {
          issues.push(`Clue ${idx + 1} is empty/blank`);
        }
      });
    }
    
    // Check acceptedAnswers if exists
    if (q.acceptedAnswers !== undefined) {
      if (!Array.isArray(q.acceptedAnswers)) {
        issues.push('acceptedAnswers is not an array');
      } else {
        const mainAnswerLower = q.answer.toLowerCase();
        const hasMainAnswer = q.acceptedAnswers.some(a => a.toLowerCase() === mainAnswerLower);
        if (!hasMainAnswer && q.acceptedAnswers.length > 0) {
          issues.push('acceptedAnswers does not contain main answer');
        }
      }
    }
    
    if (issues.length > 0) {
      structuralIssues.push({ id: q.id, answer: q.answer, category: q.category, difficulty: q.difficulty, issues });
    }
  });
  
  console.log('\nStructural validation results:');
  if (structuralIssues.length > 0) {
    structuralIssues.forEach(s => {
      console.log(`  ❌ Q${s.id} (${s.category}-${s.difficulty}: ${s.answer}):`);
      s.issues.forEach(issue => console.log(`      - ${issue}`));
    });
  } else {
    console.log('  ✅ All questions pass structural validation');
  }

  // =============================================
  // 4. FINAL SUMMARY
  // =============================================
  console.log('\n' + '='.repeat(80));
  console.log('4. FINAL SUMMARY');
  console.log('='.repeat(80));
  
  console.log(`\nTotal questions: ${totalQuestions}`);
  console.log(`Expected total: ${11 * 3 * 20} (11 categories × 3 difficulties × 20)`);
  
  console.log('\n--- Count Check ---');
  if (countIssues.length === 0) {
    console.log('✅ PASSED: All category×difficulty combinations have exactly 20 questions');
  } else {
    console.log('❌ FAILED: Count mismatches found');
    countIssues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  console.log('\n--- Duplicate IDs ---');
  if (duplicateIds.length === 0) {
    console.log('✅ PASSED: No duplicate IDs');
  } else {
    console.log('❌ FAILED: Duplicate IDs found');
    duplicateIds.forEach(d => console.log(`  - ID ${d.id} appears ${d.count} times`));
  }
  
  console.log('\n--- Duplicate Answers (same category+difficulty) ---');
  if (duplicateAnswers.length === 0) {
    console.log('✅ PASSED: No duplicate answers within same category+difficulty');
  } else {
    console.log('❌ FAILED: Duplicate answers found');
    duplicateAnswers.forEach(d => console.log(`  - ${d.category}-${d.difficulty}: "${d.answer}" (ids: ${d.ids.join(', ')})`));
  }
  
  console.log('\n--- Duplicate Clues Within Question ---');
  if (duplicateCluesInQuestion.length === 0) {
    console.log('✅ PASSED: No duplicate clues within same question');
  } else {
    console.log('❌ FAILED: Duplicate clues within questions');
    duplicateCluesInQuestion.forEach(d => console.log(`  - Q${d.id}: ${d.duplicates.join(', ')}`));
  }
  
  console.log('\n--- Similar Questions (4+ shared clues) ---');
  if (similarQuestions.length === 0) {
    console.log('✅ PASSED: No questions sharing 4+ identical clues');
  } else {
    console.log('❌ FAILED: Similar questions found');
    similarQuestions.forEach(s => console.log(`  - ${s.category}-${s.difficulty}: Q${s.q1.id} & Q${s.q2.id} (${s.matchCount} shared clues)`));
  }
  
  console.log('\n--- Structural Validation ---');
  if (structuralIssues.length === 0) {
    console.log('✅ PASSED: All questions structurally valid');
  } else {
    console.log('❌ FAILED: Structural issues found');
    structuralIssues.forEach(s => console.log(`  - Q${s.id} (${s.category}-${s.difficulty}: ${s.answer}): ${s.issues.join('; ')}`));
  }
  
  // Final verdict
  const allPassed = countIssues.length === 0 && duplicateIds.length === 0 && 
                    duplicateAnswers.length === 0 && duplicateCluesInQuestion.length === 0 &&
                    similarQuestions.length === 0 && structuralIssues.length === 0;
  
  console.log('\n' + '='.repeat(80));
  if (allPassed) {
    console.log('✅ ALL CHECKS PASSED');
  } else {
    console.log('❌ ISSUES FOUND');
  }
  console.log('='.repeat(80));
}

runVerification();