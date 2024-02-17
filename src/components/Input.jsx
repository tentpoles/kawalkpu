/* eslint-disable react/prop-types */
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function InputSelect({ state, setState, options, disabled }) {

  const handleChange = (event) => {
    setState((prevState) => {
      return {
        ...prevState,
        selectedProvince: event.target.value,
      }
    });
  };

  return (
    <Box sx={{ minWidth: 120, maxWidth: '280px' }}>
      <FormControl fullWidth>
        <InputLabel id="simple-select-label">Provinsi</InputLabel>
        <Select
          labelId="simple-select-label"
          id="simple-select"
          value={state.selectedProvince}
          label="Provinsi"
          onChange={handleChange}
          disabled={disabled}
        >
          {
            options.map((option, idx) => {
              return (
                <MenuItem value={option.kode} key={idx}>{option.nama}</MenuItem>
              )
            })
          }
        </Select>
      </FormControl>
    </Box>
  );
}
