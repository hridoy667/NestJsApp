/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './employees.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmployeesService {
    constructor(@InjectRepository(Employee)
    private employeeRepository: Repository<Employee>
    ) { }

    async create(employeeData: Partial<Employee>):
        Promise<Employee> {
        const employee = this.employeeRepository.create(employeeData);
        return this.employeeRepository.save(employee);
    }

    async findAll(): Promise<Employee[]> {
        return this.employeeRepository.find();
    }

    async findOne(id: number): Promise<Employee> {
        const employee = await this.employeeRepository.findOneBy({ id });
        if (!employee) {
            throw new NotFoundException(`User not found with id ${id}`);
        }
        return employee;
    }

    async update(id: number, updatedData: Partial<Employee>): Promise<Employee> {
        const employee = await this.employeeRepository.findOneBy({ id });
        if (!employee) {
            throw new NotFoundException(`Employee not found with id ${id}`);
        }
        const updated = Object.assign(employee, updatedData);

        return this.employeeRepository.save(updated)
    }

    async delete(id: number): Promise<{ message: string }> {
        const result = await this.employeeRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Employee with id ${id} not found`)
        }

        return { message: `Employee with id ${id} is deleted` }
    }

    // Searching

    async search(filters: { name?: string; department?: string }): Promise<Employee[]> {
        const query = this.employeeRepository.createQueryBuilder('employee'); //table name
        if (filters.name) {
            query.andWhere('employee.name ILIKE :name',
                { name: `%${filters.name}%` })
        }
        if (filters.department) {
            query.andWhere('employee.department = :dept',
                { dept: filters.department })
        }

        return query.getMany();
    }
}
