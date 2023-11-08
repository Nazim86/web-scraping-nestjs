import { Test, TestingModule } from '@nestjs/testing';
import { BinaService } from './bina.service';

describe('BinaService', () => {
  let service: BinaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BinaService],
    }).compile();

    service = module.get<BinaService>(BinaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
