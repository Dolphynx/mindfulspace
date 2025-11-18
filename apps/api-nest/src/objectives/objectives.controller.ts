import { Body, Controller, Post, Get } from '@nestjs/common';
import { ObjectivesService } from './objectives.service';
import { ProposeObjectivesDto, SaveObjectiveDto } from './dto/propose-objectives.dto';

@Controller('objectives')
export class ObjectivesController {
  constructor(private readonly objectivesService: ObjectivesService) {}

  @Get()
  findForDemoUser() {
    return this.objectivesService.getObjectivesForDemoUser();
  }

  @Post('propose')
  propose(@Body() body: ProposeObjectivesDto) {
    return this.objectivesService.proposeForSessionType(body.sessionTypeId);
  }

  @Post('save')
  save(@Body() body: SaveObjectiveDto) {
    return this.objectivesService.saveObjectiveFromLevel(
      body.sessionTypeId,
      body.level,
    );
  }
}
