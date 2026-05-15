import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('Testing connection to Supabase...')
  
  const { data, error } = await supabase
    .from("Article")
    .select(`
      *,
      category:ArticleCategory (name),
      author:PsychiatristProfile (
        user:User (name)
      ),
      topics:ArticleTopic (
        categoryTopic:ArticleCategoryTopic (name)
      )
    `)
    .eq("status", "published");
    
  if (error) {
    console.error('Error with joins:', error.message)
    // Try without author join
    const { data: data2, error: error2 } = await supabase
      .from("Article")
      .select(`
        *,
        category:ArticleCategory (name),
        topics:ArticleTopic (
          categoryTopic:ArticleCategoryTopic (name)
        )
      `)
      .eq("status", "published");
    
    if (error2) {
      console.error('Error without author join:', error2.message)
    } else {
      console.log('Success without author join:', data2)
    }
  } else {
    console.log('Success with all joins:', data)
  }
}

test()
