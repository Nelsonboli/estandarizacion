import { Test, TestingModule } from '@nestjs/testing';
import { SocializacionController } from './socializacion.controller';
import { SocializacionService } from './socializacion.service';

describe('SocializacionController', () => {
  let controller: SocializacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocializacionController],
      providers: [SocializacionService],
    }).compile();

    controller = module.get<SocializacionController>(SocializacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
