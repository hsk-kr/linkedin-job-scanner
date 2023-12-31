import { ComponentProps, useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import styled from '@emotion/styled';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import { JobCondition } from '@/types/job';
import TaskConditionList from './TaskConditionList';
import ConditionCheckModal from '../ConditionCheckModal';

type Value = ITaskForm & {
  jobConditions: ComponentProps<typeof TaskConditionList>['items'];
};

interface TaskFormBodyProps {
  isEdit?: boolean;
  initialValue?: Value;
  onDataChange?: (value: Value) => void;
  onSubmit?: (
    taskForm: ITaskForm,
    jobConditions: ComponentProps<typeof TaskConditionList>['items']
  ) => void;
}

export interface ITaskForm {
  taskName: string;
  delay: number;
}

const Form = styled.form`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const LinkButton = styled.span`
  cursor: pointer;
  text-decoration: underline;
  color: blue;
`;

const TaskFormBody = ({
  isEdit,
  initialValue,
  onSubmit,
  onDataChange,
}: TaskFormBodyProps) => {
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ITaskForm>();
  const [modalOpen, setModalOpen] = useState(false);
  const [jobConditions, setJobConditions] = useState<JobCondition[]>([]);
  const submitButtonColor = isEdit ? 'warning' : 'primary';
  const submitButtonText = isEdit ? 'Update Task' : 'Create Task';

  const submitHandler: SubmitHandler<ITaskForm> = (data) => {
    onSubmit?.(data, jobConditions);
  };

  const toggleModalOpen = () => {
    setModalOpen((prevModalOpen) => !prevModalOpen);
  };

  const handleJobConditionAdd: ComponentProps<
    typeof TaskConditionList
  >['onJobConditionAdd'] = (jobCondition) => {
    setJobConditions((prevJobConditions) =>
      prevJobConditions.concat(jobCondition)
    );
  };

  const handleJobConditionRemove: ComponentProps<
    typeof TaskConditionList
  >['onJobConditionRemove'] = (jobConditionId) => {
    setJobConditions((prevJobConditions) =>
      prevJobConditions.filter((jc) => jc.id !== jobConditionId)
    );
  };

  const handleSubConditionAdd: ComponentProps<
    typeof TaskConditionList
  >['onSubConditionAdd'] = (jobConditionId, subCondition) => {
    setJobConditions((prevJobConditions) =>
      prevJobConditions.map((jc) => {
        if (jc.id === jobConditionId) {
          jc.subConditions = jc.subConditions.concat(subCondition);
          return jc;
        }

        return jc;
      })
    );
  };

  const handleSubConditionRemove: ComponentProps<
    typeof TaskConditionList
  >['onSubConditionRemove'] = (jobConditionId, subConditionId) => {
    setJobConditions((prevJobConditions) =>
      prevJobConditions.map((jc) => {
        if (jc.id === jobConditionId) {
          jc.subConditions = jc.subConditions.filter(
            (sc) => sc.id !== subConditionId
          );
          return jc;
        }

        return jc;
      })
    );
  };

  useEffect(() => {
    if (!initialValue) {
      setJobConditions([{ id: uuidv4(), subConditions: [] }]);
    } else {
      setValue('taskName', initialValue.taskName);
      setValue('delay', initialValue.delay);
      setJobConditions(initialValue.jobConditions);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  const { taskName, delay } = watch();
  useEffect(() => {
    const values = getValues();

    onDataChange?.({
      taskName: values.taskName,
      delay: values.delay,
      jobConditions,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskName, delay, jobConditions]);

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit(submitHandler)();
      }}
    >
      <Box display="flex" flexDirection="column" rowGap={2} mt={2}>
        <Box display="flex" columnGap={1} paddingLeft={1} paddingRight={1}>
          <TextField
            {...register('taskName', {
              required: 'Task Name is required.',
              maxLength: {
                value: 12,
                message: 'The name must be less than 13 characters.',
              },
            })}
            focused
            data-testid="taskName"
            size="small"
            sx={{ flex: 1 }}
            label="Task Name"
            error={errors.taskName !== undefined}
            helperText={errors.taskName?.message}
          />
          <Tooltip title="Delay before moving on to the next job ad (2000ms recommended)">
            <TextField
              {...register('delay', {
                required: 'Delay is required.',
                min: {
                  value: 1000,
                  message: 'Delay must be greater than or equal to 1000.',
                },
                max: {
                  value: 10000,
                  message: 'Delay must be less than or equal to 10000.',
                },
              })}
              size="small"
              data-testid="delay"
              sx={{ flex: 1 }}
              label="Delay(ms)"
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              error={errors.delay !== undefined}
              helperText={errors.delay?.message}
            />
          </Tooltip>
        </Box>
        <Divider />
      </Box>
      <Alert severity="info" sx={{ marginBottom: 1 }}>
        Jobs that meet all conditions will be found.{' '}
        <LinkButton
          data-testid="conditionCheckOpenLink"
          onClick={toggleModalOpen}
        >
          Click here to test if your conditions meet your expectations.
        </LinkButton>
      </Alert>
      <TaskConditionList
        items={jobConditions}
        onJobConditionAdd={handleJobConditionAdd}
        onJobConditionRemove={handleJobConditionRemove}
        onSubConditionAdd={handleSubConditionAdd}
        onSubConditionRemove={handleSubConditionRemove}
      />
      <Button type="submit" variant="contained" color={submitButtonColor}>
        {submitButtonText}
      </Button>
      <ConditionCheckModal
        visible={modalOpen}
        onClose={toggleModalOpen}
        jobConditions={jobConditions}
      />
    </Form>
  );
};

export default TaskFormBody;
