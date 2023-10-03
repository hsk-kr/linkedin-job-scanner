import { test, describe, expect, beforeEach } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import TaskFormBody from '.';

describe('TaskFormBody', () => {
  test('should open and close the conditional check modal', async () => {
    const { getByTestId, findByTestId, queryByTestId } = render(
      <TaskFormBody />
    );
    const conditionCheckOpenLink = getByTestId('conditionCheckOpenLink');
    conditionCheckOpenLink.click();

    const conditionCheckModal = await findByTestId('conditionCheckModal');
    expect(conditionCheckModal).toBeInTheDocument();

    const conditionCheckModalCloseBtn = getByTestId(
      'conditionCheckModalCloseBtn'
    );

    act(() => {
      conditionCheckModalCloseBtn.click();
    });

    expect(queryByTestId('conditionCheckModal')).toBeNull();
  });

  test('should intialize with the initial value prop', () => {
    const { getByTestId } = render(
      <TaskFormBody
        isEdit={true}
        initialValue={{
          taskName: 'test task name',
          delay: 5000,
          jobConditions: [
            {
              id: 'jca',
              subConditions: [
                {
                  id: 'sca',
                  not: false,
                  caseInsensitive: true,
                  operator: '=',
                  frequency: 5,
                  target: 'title',
                  text: 'test',
                },
                {
                  id: 'scb',
                  not: true,
                  caseInsensitive: true,
                  operator: '<=',
                  frequency: 3,
                  target: 'description',
                  text: 'desc',
                },
              ],
            },
          ],
        }}
      />
    );

    const taskName = getByTestId('taskName').querySelector(
      'input'
    ) as HTMLInputElement;
    expect(taskName.value).toEqual('test task name');

    const delay = getByTestId('delay').querySelector(
      'input'
    ) as HTMLInputElement;
    expect(delay.value).toEqual('5000');

    screen.getByText(/ci, Job Title, =, 5, "test"/);
    screen.getByText(/not, ci, Job Description, <=, 3, "desc"/);
  });
});

describe('TaskConditionList', () => {
  beforeEach(() => {
    render(<TaskFormBody />);
  });

  test('should render one condition item by default.', () => {
    const items = screen.getAllByTestId('taskConditionListItem');
    expect(items).toHaveLength(1);
  });

  test('should add one condition', () => {
    const jobConditionAddBtn = screen.getByTestId('jobConditionAddBtn');

    act(() => {
      jobConditionAddBtn.click();
    });

    const items = screen.getAllByTestId('taskConditionListItem');
    expect(items).toHaveLength(2);
  });

  test('should not have a delete button', () => {
    const btn = screen.queryByTestId('jobConditionRemoveBtn');
    expect(btn).toBeNull();
  });

  test('should delete an item', () => {
    const jobConditionAddBtn = screen.getByTestId('jobConditionAddBtn');

    act(() => {
      jobConditionAddBtn.click();
    });

    const jobConditionRemoveBtns = screen.getAllByTestId(
      'jobConditionRemoveBtn'
    );
    act(() => {
      jobConditionRemoveBtns[0].click();
    });

    const items = screen.getAllByTestId('taskConditionListItem');
    expect(items).toHaveLength(1);
  });
});

describe('TaskConditionListItem', () => {
  let conditionAddBtn: HTMLButtonElement;
  let not: HTMLInputElement;
  let ci: HTMLInputElement;
  let target: HTMLInputElement;
  let operator: HTMLInputElement;
  let frequency: HTMLInputElement;
  let text: HTMLInputElement;
  let formVisibleToggleBtn: HTMLButtonElement;

  beforeEach(() => {
    const { getByTestId } = render(<TaskFormBody />);
    conditionAddBtn = getByTestId('conditionAddBtn') as HTMLButtonElement;
    not = getByTestId('not') as HTMLInputElement;
    ci = getByTestId('ci') as HTMLInputElement;
    target = getByTestId('target').querySelector('input') as HTMLInputElement;
    operator = getByTestId('operator').querySelector(
      'input'
    ) as HTMLInputElement;
    frequency = getByTestId('frequency').querySelector(
      'input'
    ) as HTMLInputElement;
    text = getByTestId('text').querySelector('input') as HTMLInputElement;
    formVisibleToggleBtn = getByTestId(
      'formVisibleToggleBtn'
    ) as HTMLButtonElement;
  });

  test('should add a subcondition item with default values', async () => {
    conditionAddBtn.click();

    const chip = await screen.findByTestId('chip');
    expect(chip).toBeInTheDocument();

    expect(chip.textContent).toMatch(/Job Title, >=, 1, ""/);
  });

  test('should add a subcondition item correctly with input values', async () => {
    fireEvent.click(not);
    fireEvent.click(ci);
    fireEvent.change(target, { target: { value: 'description' } });
    fireEvent.change(operator, { target: { value: '=' } });
    fireEvent.change(frequency, { target: { value: '3' } });
    fireEvent.change(text, { target: { value: 'test ' } });
    conditionAddBtn.click();

    const chip = await screen.findByTestId('chip');
    expect(chip).toBeInTheDocument();

    expect(chip.textContent).toMatch(/not, ci, Job Description, =, 3, "test "/);
  });

  test('should remove a subcondition', () => {
    act(() => {
      conditionAddBtn.click();
      conditionAddBtn.click();
    });

    let subConditions = screen.getAllByTestId('chip');
    expect(subConditions).toHaveLength(2);

    const deleteBtn = subConditions[0].querySelector<SVGElement>(
      '.MuiChip-deleteIconMedium'
    );
    deleteBtn && fireEvent.click(deleteBtn);

    subConditions = screen.getAllByTestId('chip');
    expect(subConditions).toHaveLength(1);
  });

  test('should be invisible of the form', () => {
    act(() => {
      formVisibleToggleBtn.click();
    });

    expect(screen.queryByTestId('not')).toBe(null);
    expect(screen.queryByTestId('ci')).toBe(null);
    expect(screen.queryByTestId('target')).toBe(null);
    expect(screen.queryByTestId('operator')).toBe(null);
    expect(screen.queryByTestId('frequency')).toBe(null);
    expect(screen.queryByTestId('text')).toBe(null);
  });

  test('should be visible of the form', () => {
    act(() => {
      formVisibleToggleBtn.click();
    });

    act(() => {
      formVisibleToggleBtn.click();
    });

    expect(screen.queryByTestId('not')).not.toBe(null);
    expect(screen.queryByTestId('ci')).not.toBe(null);
    expect(screen.queryByTestId('target')).not.toBe(null);
    expect(screen.queryByTestId('operator')).not.toBe(null);
    expect(screen.queryByTestId('frequency')).not.toBe(null);
    expect(screen.queryByTestId('text')).not.toBe(null);
  });
});
