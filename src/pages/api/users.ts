import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient(process.env.supabaseUrl!, process.env.supabaseKey!);

  switch (req.method) {
    case 'GET':
      supabase
        .from('users')
        .select('*')
        .then((data) => {
          res.status(200).json(data);
        });
      break;
    case 'POST':
      supabase.from('users').insert([
        {
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        },
      ]);
      break;

    default:
      break;
  }
}
