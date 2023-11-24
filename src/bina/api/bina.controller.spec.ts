import { Test, TestingModule } from '@nestjs/testing';
import { BinaController } from './bina.controller';

describe('BinaController', () => {
  let controller: BinaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BinaController],
    }).compile();

    controller = module.get<BinaController>(BinaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
