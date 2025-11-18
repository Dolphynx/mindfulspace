import { Controller, Get, Query } from "@nestjs/common";
import { ResourcesService } from "./resources.service";
import { GetResourcesDto } from "./dto/get-resources.dto";

@Controller("resources")
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  findAll(@Query() query: GetResourcesDto) {
    return this.resourcesService.findAll(query);
  }

  @Get("categories")
  findCategories() {
    return this.resourcesService.findCategories();
  }
}
