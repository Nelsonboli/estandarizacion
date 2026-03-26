import { Test, TestingModule } from '@nestjs/testing';
import { SocializacionService } from './socializacion.service';

describe('SocializacionService', () => {
  let service: SocializacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocializacionService],
    }).compile();

    service = module.get<SocializacionService>(SocializacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
