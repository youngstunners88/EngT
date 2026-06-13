# Word Selection

Current state:
- the game uses fixed word lists by difficulty
- target words are selected from the pool
- used words are cycled when the pool is exhausted

Layer 3 state:
- choose words from mastery data
- prioritize weak words
- mix in review items
- bias toward patterns that support current learning goals

Selection policy:
1. review due words
2. weak words
3. recently missed patterns
4. new words in the right difficulty band

Do not choose words purely by randomness once adaptation is available.
