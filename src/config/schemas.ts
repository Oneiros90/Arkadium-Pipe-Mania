import { z } from 'zod';

export const PipeConfigSchema = z.object({
  type: z.enum(['straight', 'curved', 'cross']),
  weight: z.number().min(0).default(1)
});

export const GameConfigSchema = z.object({
  grid: z.object({
    width: z.number().int().min(5).default(9),
    height: z.number().int().min(5).default(7)
  }),
  gameplay: z.object({
    blockRatio: z.number().min(0).max(0.5).default(0.15),
    minPathLength: z.object({
      min: z.number().int().min(3).default(5),
      max: z.number().int().min(3).default(8)
    }),
    flowSpeed: z.number().min(0.1).max(2).default(0.5),
    placementDelay: z.number().min(0).default(2)
  }),
  pipes: z.array(PipeConfigSchema).min(1).default([
    { type: 'straight', weight: 1 },
    { type: 'curved', weight: 1 },
    { type: 'cross', weight: 0.5 }
  ]),
  visual: z.object({
    cellSize: z.number().int().min(32).default(64),
    gridPadding: z.number().int().min(0).default(10),
    queueSize: z.number().int().min(3).default(5)
  }),
  seed: z.number().int().optional()
});

export type GameConfig = z.infer<typeof GameConfigSchema>;
export type PipeConfig = z.infer<typeof PipeConfigSchema>;
