<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Entry extends Model
{
  use HasFactory;

  protected $fillable = [
    'person',
    'date',
    'start_date',
    'finish_date',
    'description',
    'status',
  ];

  protected $casts = [
    'date' => 'date',
    'start_date' => 'datetime:H:i',
    'finish_date' => 'datetime:H:i',
  ];
}
