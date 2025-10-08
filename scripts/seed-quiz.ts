import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { SeedDefinition } from '../lib/quiz/types';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedQuiz() {
  console.log('🌱 Starting quiz seeding...\n');

  // Read the seed file
  const seedPath = join(process.cwd(), 'seed', 'quiz.definition.json');
  let seedData: SeedDefinition;

  try {
    const seedContent = readFileSync(seedPath, 'utf-8');
    seedData = JSON.parse(seedContent);
    console.log(`✅ Loaded seed file (version: ${seedData.version})\n`);
  } catch (error) {
    console.error('❌ Error reading seed file:', error);
    process.exit(1);
  }

  let totalSections = 0;
  let totalQuestions = 0;
  let totalOptions = 0;

  // Process each section
  for (const sectionDef of seedData.sections) {
    console.log(`📁 Processing section: ${sectionDef.title} (${sectionDef.key})`);

    // Upsert section
    const { data: section, error: sectionError } = await supabase
      .from('quiz_sections')
      .upsert(
        {
          key: sectionDef.key,
          title: sectionDef.title,
          description: sectionDef.description,
          sort_order: sectionDef.sort_order,
          is_optional: sectionDef.is_optional,
          visible_if: sectionDef.visible_if,
          is_active: true,
        },
        {
          onConflict: 'key',
        }
      )
      .select()
      .single();

    if (sectionError) {
      console.error(`   ❌ Error upserting section ${sectionDef.key}:`, sectionError);
      continue;
    }

    totalSections++;
    console.log(`   ✅ Section upserted (ID: ${section.id})`);

    // Process questions in this section
    for (const questionDef of sectionDef.questions) {
      console.log(`   📝 Processing question: ${questionDef.prompt.substring(0, 50)}...`);

      // Upsert question
      const { data: question, error: questionError } = await supabase
        .from('quiz_questions')
        .upsert(
          {
            section_id: section.id,
            key: questionDef.key,
            prompt: questionDef.prompt,
            type: questionDef.type,
            required: questionDef.required,
            sort_order: questionDef.sort_order,
            help_text: questionDef.help_text,
            ui_props: questionDef.ui_props,
            visible_if: questionDef.visible_if,
            is_active: true,
          },
          {
            onConflict: 'key',
          }
        )
        .select()
        .single();

      if (questionError) {
        console.error(
          `      ❌ Error upserting question ${questionDef.key}:`,
          questionError
        );
        continue;
      }

      totalQuestions++;
      console.log(`      ✅ Question upserted (ID: ${question.id})`);

      // Process options if they exist
      if (questionDef.options && questionDef.options.length > 0) {
        // Delete existing options for this question
        await supabase
          .from('quiz_options')
          .delete()
          .eq('question_id', question.id);

        // Insert new options
        const optionsToInsert = questionDef.options.map((opt, idx) => ({
          question_id: question.id,
          label: opt.label,
          value: opt.value,
          sort_order: idx + 1,
          tags: opt.tags,
          weight: opt.weight,
        }));

        const { error: optionsError } = await supabase
          .from('quiz_options')
          .insert(optionsToInsert);

        if (optionsError) {
          console.error(
            `      ❌ Error inserting options for ${questionDef.key}:`,
            optionsError
          );
        } else {
          totalOptions += optionsToInsert.length;
          console.log(`      ✅ Inserted ${optionsToInsert.length} options`);
        }
      }
    }

    console.log('');
  }

  console.log('═══════════════════════════════════════');
  console.log('🎉 Seeding complete!');
  console.log(`   📁 Sections: ${totalSections}`);
  console.log(`   📝 Questions: ${totalQuestions}`);
  console.log(`   ⚡ Options: ${totalOptions}`);
  console.log('═══════════════════════════════════════\n');
}

// Run the seed function
seedQuiz()
  .then(() => {
    console.log('✅ Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

